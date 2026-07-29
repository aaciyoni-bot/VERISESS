// =========================================================
// VeriSess — צ'אט אסינכרוני מאובטח (בין פגישות)
// =========================================================
import { collection, query, where, onSnapshot, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.js';

export const threadId = (a, b) => [a, b].sort().join('__');

export function subscribeThread(tid, cb) {
  if (!tid || !db) { cb([]); return () => {}; }
  const q = query(collection(db, 'messages'), where('threadId', '==', tid));
  return onSnapshot(q, (s) => {
    cb(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)));
  }, () => cb([]));
}

export async function sendChat({ tid, fromUid, participants, text }) {
  if (!tid || !fromUid || !text?.trim() || !db) return;
  await addDoc(collection(db, 'messages'), {
    threadId: tid, fromUid, participants, text: text.trim(), createdAt: Date.now(),
  });
  // מעדכן מסמך thread לסיכום אחרון (לרשימות)
  try { await setDoc(doc(db, 'threads', tid), { participants, lastText: text.trim().slice(0, 80), lastAt: Date.now() }, { merge: true }); } catch { /* noop */ }
}
