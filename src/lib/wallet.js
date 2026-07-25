// =========================================================
// VeriSess — מנוע הארנק (טוקנים)  ·  1 טוקן = 1 ₪ תמיד
// =========================================================
// מממש את חוזה ה-API של הארנק המשותף לכל אתרי המשפחה.
// מבנה הנתונים ב-Firestore (זהה בכל הפרויקטים):
//
//   wallets/{uid}          balanceAvailable, balanceHeld, updatedAt
//   wallet_ledger/{id}     uid, type, amount, siteId, reference, holdId, createdAt   (append-only)
//   wallet_holds/{holdId}  uid, siteId, amount, reference, providerId, status, createdAt
//   wallet_payouts/{id}    uid, amount, status, createdAt
//
// ⚠️ פיילוט: הפעולות רצות מהדפדפן בתוך טרנזקציות Firestore. לפני השקה
//    ציבורית יש להעביר אותן ל-Cloud Functions Callable (שלב ז') ולהדק
//    את חוקי האבטחה. ראה SETUP-FIREBASE.md.

import {
  doc, collection, runTransaction, serverTimestamp,
  onSnapshot, query, where, orderBy,
} from 'firebase/firestore';
import { db, SITE_ID } from '../firebase.js';

// ---------------------------------------------------------
// עמלות הפלטפורמה לפי סוג הפגישה (חלק מהברוטו שנגבה)
// ---------------------------------------------------------
export const PLATFORM_FEES = {
  scheduled: 0.20, // פגישה מתוזמנת
  sos: 0.30,       // זמינות מיידית 24/7
  deal: 0.20,      // דיל רגע-אחרון
  group: 0.15,     // מפגש קבוצתי
};

// ה-UID של ארנק הבעלים. כל capture מזין אותו אוטומטית.
export const PLATFORM_UID = 'platform';

const walletRef = (uid) => doc(db, 'wallets', uid);
const ledgerRef = () => doc(collection(db, 'wallet_ledger'));
const holdRef = (holdId) => doc(db, 'wallet_holds', holdId);

// קורא/יוצר יתרת ארנק בתוך טרנזקציה
async function readWallet(tx, uid) {
  const ref = walletRef(uid);
  const snap = await tx.get(ref);
  if (!snap.exists()) {
    return { ref, data: { balanceAvailable: 0, balanceHeld: 0 }, isNew: true };
  }
  return { ref, data: snap.data(), isNew: false };
}

function writeLedger(tx, entry) {
  tx.set(ledgerRef(), {
    siteId: SITE_ID,
    holdId: null,
    reference: null,
    ...entry,
    createdAt: serverTimestamp(),
  });
}

// =========================================================
// walletHold — שריון טוקנים מהלקוח לטובת פגישה
// =========================================================
// מחזיר holdId. זורק אם אין יתרה מספקת.
export async function walletHold({ uid, siteId = SITE_ID, amount, reference, providerId }) {
  const amt = Math.round(Number(amount));
  if (!uid) throw new Error('walletHold: חסר uid');
  if (!(amt > 0)) throw new Error('walletHold: amount חייב להיות חיובי');

  const newHoldRef = holdRef(doc(collection(db, 'wallet_holds')).id);

  await runTransaction(db, async (tx) => {
    const client = await readWallet(tx, uid);
    const available = Number(client.data.balanceAvailable || 0);
    if (available < amt) {
      throw new Error(`walletHold: יתרה לא מספקת (${available} < ${amt})`);
    }

    tx.set(client.ref, {
      balanceAvailable: available - amt,
      balanceHeld: Number(client.data.balanceHeld || 0) + amt,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    tx.set(newHoldRef, {
      uid, siteId, amount: amt, reference: reference || null,
      providerId: providerId || null, status: 'active',
      createdAt: serverTimestamp(),
    });

    writeLedger(tx, { uid, type: 'hold', amount: -amt, siteId, reference, holdId: newHoldRef.id });
  });

  return newHoldRef.id;
}

// =========================================================
// computeSplits — עוזר לחישוב פיצול לפי סוג פגישה
// =========================================================
// מקבל את הסכום שנוצל בפועל (grossUsed) ומחזיר { providerAmount, platformAmount }.
export function computeSplits({ grossUsed, sessionType = 'scheduled' }) {
  const gross = Math.round(Number(grossUsed));
  const feeRate = PLATFORM_FEES[sessionType] ?? PLATFORM_FEES.scheduled;
  const platformAmount = Math.round(gross * feeRate);
  const providerAmount = gross - platformAmount;
  return { providerAmount, platformAmount };
}

// =========================================================
// walletCapture — גבייה בפועל בסוף הפגישה (הלב של המונה)
// =========================================================
// מותר לגבות פחות מהשריון: נטו למומחה + עמלה ל-platform, והשאר חוזר
// ללקוח אוטומטית באותה טרנזקציה.
//
// splits: מערך [{ uid, amount }] של הזכאים (מומחה + platform וכו').
//   סכום ה-splits = הסכום שנגבה בפועל (captured), חייב להיות <= סכום השריון.
//   ניתן במקום זה להעביר { providerId, providerAmount, platformAmount }.
export async function walletCapture({ holdId, splits, providerId, providerAmount, platformAmount }) {
  if (!holdId) throw new Error('walletCapture: חסר holdId');

  // נורמליזציה של splits
  let normSplits = splits;
  if (!normSplits) {
    normSplits = [];
    if (providerAmount > 0) normSplits.push({ uid: providerId, amount: Math.round(providerAmount) });
    if (platformAmount > 0) normSplits.push({ uid: PLATFORM_UID, amount: Math.round(platformAmount) });
  }
  normSplits = normSplits
    .map((s) => ({ uid: s.uid, amount: Math.round(Number(s.amount)) }))
    .filter((s) => s.uid && s.amount > 0);

  const captured = normSplits.reduce((sum, s) => sum + s.amount, 0);

  await runTransaction(db, async (tx) => {
    const hRef = holdRef(holdId);
    const hSnap = await tx.get(hRef);
    if (!hSnap.exists()) throw new Error('walletCapture: שריון לא קיים');
    const hold = hSnap.data();
    if (hold.status !== 'active') throw new Error(`walletCapture: שריון במצב ${hold.status}`);
    if (captured > hold.amount) {
      throw new Error(`walletCapture: הגבייה (${captured}) גדולה מהשריון (${hold.amount})`);
    }

    // קריאות ראשונה (Firestore: כל הקריאות לפני כל הכתיבות)
    const client = await readWallet(tx, hold.uid);
    const payeeReads = [];
    for (const s of normSplits) {
      payeeReads.push({ split: s, wallet: await readWallet(tx, s.uid) });
    }

    const refund = hold.amount - captured;

    // כתיבות: שחרור השריון מ-balanceHeld של הלקוח + החזר השארית
    tx.set(client.ref, {
      balanceHeld: Number(client.data.balanceHeld || 0) - hold.amount,
      balanceAvailable: Number(client.data.balanceAvailable || 0) + refund,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // זיכוי כל זכאי (מומחה + platform)
    for (const { split, wallet } of payeeReads) {
      tx.set(wallet.ref, {
        balanceAvailable: Number(wallet.data.balanceAvailable || 0) + split.amount,
        balanceHeld: Number(wallet.data.balanceHeld || 0),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    // ספר תנועות
    writeLedger(tx, { uid: hold.uid, type: 'capture', amount: -captured, siteId: hold.siteId, reference: hold.reference, holdId });
    for (const s of normSplits) {
      const type = s.uid === PLATFORM_UID ? 'fee' : 'earning';
      writeLedger(tx, { uid: s.uid, type, amount: s.amount, siteId: hold.siteId, reference: hold.reference, holdId });
    }
    if (refund > 0) {
      writeLedger(tx, { uid: hold.uid, type: 'refund', amount: refund, siteId: hold.siteId, reference: hold.reference, holdId });
    }

    tx.update(hRef, { status: 'captured', capturedAmount: captured, closedAt: serverTimestamp() });
  });

  return { captured };
}

// =========================================================
// walletRelease — ביטול, הכל חוזר ללקוח
// =========================================================
export async function walletRelease({ holdId }) {
  if (!holdId) throw new Error('walletRelease: חסר holdId');

  await runTransaction(db, async (tx) => {
    const hRef = holdRef(holdId);
    const hSnap = await tx.get(hRef);
    if (!hSnap.exists()) throw new Error('walletRelease: שריון לא קיים');
    const hold = hSnap.data();
    if (hold.status !== 'active') throw new Error(`walletRelease: שריון במצב ${hold.status}`);

    const client = await readWallet(tx, hold.uid);
    tx.set(client.ref, {
      balanceHeld: Number(client.data.balanceHeld || 0) - hold.amount,
      balanceAvailable: Number(client.data.balanceAvailable || 0) + hold.amount,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    writeLedger(tx, { uid: hold.uid, type: 'release', amount: hold.amount, siteId: hold.siteId, reference: hold.reference, holdId });
    tx.update(hRef, { status: 'released', closedAt: serverTimestamp() });
  });
}

// =========================================================
// requestPayout — בקשת משיכה של מומחה (₪ בהעברה בנקאית)
// =========================================================
export async function requestPayout({ uid, amount }) {
  const amt = Math.round(Number(amount));
  if (!(amt > 0)) throw new Error('requestPayout: amount חייב להיות חיובי');

  const payoutRefDoc = doc(collection(db, 'wallet_payouts'));
  await runTransaction(db, async (tx) => {
    const w = await readWallet(tx, uid);
    const available = Number(w.data.balanceAvailable || 0);
    if (available < amt) throw new Error(`requestPayout: יתרה לא מספקת (${available} < ${amt})`);

    // מוציאים את הסכום מהזמין ומעבירים ל-held עד אישור האדמין
    tx.set(w.ref, {
      balanceAvailable: available - amt,
      balanceHeld: Number(w.data.balanceHeld || 0) + amt,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    tx.set(payoutRefDoc, { uid, amount: amt, status: 'pending', createdAt: serverTimestamp() });
    writeLedger(tx, { uid, type: 'payout_request', amount: -amt, siteId: SITE_ID, reference: payoutRefDoc.id });
  });
  return payoutRefDoc.id;
}

// =========================================================
// grantPilotTokens — כפתור "500 טוקני פיילוט" (עד שהחנות באוויר)
// =========================================================
export async function grantPilotTokens({ uid, amount = 500 }) {
  const amt = Math.round(Number(amount));
  await runTransaction(db, async (tx) => {
    const w = await readWallet(tx, uid);
    tx.set(w.ref, {
      balanceAvailable: Number(w.data.balanceAvailable || 0) + amt,
      balanceHeld: Number(w.data.balanceHeld || 0),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    writeLedger(tx, { uid, type: 'pilot_grant', amount: amt, siteId: SITE_ID, reference: 'pilot-500' });
  });
}

// =========================================================
// מנויים חיים (real-time)
// =========================================================
export function subscribeWallet(uid, cb) {
  return onSnapshot(walletRef(uid), (snap) => {
    cb(snap.exists() ? snap.data() : { balanceAvailable: 0, balanceHeld: 0 });
  });
}

export function subscribeLedger(uid, cb, max = 50) {
  const q = query(
    collection(db, 'wallet_ledger'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.slice(0, max).map((d) => ({ id: d.id, ...d.data() })));
  });
}
