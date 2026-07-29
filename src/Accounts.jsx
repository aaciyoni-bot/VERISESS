import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Mail, Lock, User, LogIn, CheckCircle, Clock, XCircle, Wallet, AlertTriangle, Zap,
} from 'lucide-react';
import { doc, setDoc, updateDoc, onSnapshot, collection, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { signInWithGoogle, signUpEmail, signInEmail, isAdminUser, sendReset, deleteAccount } from './lib/auth.js';

const CATEGORIES = [
  { id: 'psychology', name: 'פסיכולוגיה' },
  { id: 'law', name: 'משפט ועריכת דין' },
  { id: 'sleep', name: 'ייעוץ שינה והורות' },
  { id: 'addiction', name: 'גמילה' },
  { id: 'finance', name: 'ייעוץ פיננסי' },
  { id: 'gaming', name: 'חוגי משחק' },
  { id: 'mysticism', name: 'רוחניות ותקשור' },
];

// =========================================================
// מסך כניסה / הרשמה (Email + Google)
// =========================================================
export function LoginScreen({ onDone, title = 'כניסה ל-VeriSess' }) {
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const needsConsent = mode === 'signup';

  const handleEmail = async (e) => {
    e.preventDefault();
    if (needsConsent && !agreed) { setErr('יש לאשר את תנאי השימוש ומדיניות הפרטיות'); return; }
    setErr(''); setBusy(true);
    try {
      if (mode === 'signup') await signUpEmail(email, password, name);
      else await signInEmail(email, password);
      onDone && onDone();
    } catch (e2) {
      setErr(translateAuthError(e2?.code));
    } finally { setBusy(false); }
  };

  const handleGoogle = async () => {
    if (!agreed) { setErr('יש לאשר את תנאי השימוש ומדיניות הפרטיות'); return; }
    setErr(''); setBusy(true);
    try { await signInWithGoogle(); onDone && onDone(); }
    catch (e2) { setErr(translateAuthError(e2?.code)); }
    finally { setBusy(false); }
  };

  const [resetMsg, setResetMsg] = useState('');
  const handleReset = async () => {
    setErr(''); setResetMsg('');
    if (!email) { setErr('הזן אימייל לאיפוס הסיסמה'); return; }
    try { await sendReset(email); setResetMsg('נשלח מייל לאיפוס הסיסמה. בדוק את תיבת הדואר.'); }
    catch (e2) { setErr(translateAuthError(e2?.code)); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden">
        <div className="bg-blue-900 text-white p-6 text-center">
          <ShieldCheck className="w-12 h-12 text-teal-400 mx-auto mb-2" />
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-blue-200 text-xs mt-1">{mode === 'signup' ? 'יצירת חשבון חדש' : 'התחברות לחשבון קיים'}</p>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer bg-gray-50 border border-gray-200 rounded-xl p-3">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-teal-600" />
            <span>קראתי ואני מסכים/ה ל<b>תנאי השימוש והתקנון</b>, ל<b>מדיניות הפרטיות</b> ול<b>הצהרת הנגישות</b> של VeriSess (זמינים בתחתית העמוד).</span>
          </label>
          <button onClick={handleGoogle} disabled={busy} className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 font-bold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            <GoogleIcon /> המשך עם Google
          </button>
          <div className="flex items-center gap-3 text-gray-400 text-xs"><div className="flex-1 h-px bg-gray-200" /> או <div className="flex-1 h-px bg-gray-200" /></div>
          <form onSubmit={handleEmail} className="space-y-3">
            {mode === 'signup' && (
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3">
                <User className="w-4 h-4 text-gray-400" />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם מלא" required maxLength={60} className="flex-1 bg-transparent py-3 outline-none text-sm" />
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="אימייל" className="flex-1 bg-transparent py-3 outline-none text-sm" dir="ltr" />
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3">
              <Lock className="w-4 h-4 text-gray-400" />
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="סיסמה (6+ תווים)" className="flex-1 bg-transparent py-3 outline-none text-sm" dir="ltr" />
            </div>
            {err && <p className="text-red-500 text-sm text-center">{err}</p>}
            <button type="submit" disabled={busy} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {busy ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn className="w-4 h-4" /> {mode === 'signup' ? 'הרשמה' : 'כניסה'}</>}
            </button>
          </form>
          {resetMsg && <p className="text-green-600 text-sm text-center">{resetMsg}</p>}
          {mode === 'login' && (
            <button onClick={handleReset} className="block w-full text-center text-xs text-gray-500 hover:text-teal-600">שכחתי סיסמה</button>
          )}
          <p className="text-center text-sm text-gray-500">
            {mode === 'signup' ? 'כבר יש לך חשבון?' : 'אין לך חשבון?'}{' '}
            <button onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setErr(''); }} className="text-teal-600 font-bold hover:underline">
              {mode === 'signup' ? 'התחבר' : 'הירשם'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// הרשמת מומחה — כותב providers/{uid} עם status='pending'
// =========================================================
export function ProviderOnboarding({ user, onComplete }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ displayName: '', category: 'psychology', rate: 300, bio: '', tags: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }
    getDoc(doc(db, 'providers', user.uid)).then((snap) => {
      if (snap.exists()) setProfile(snap.data());
      else setForm((f) => ({ ...f, displayName: user.displayName || '' }));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  if (!user) return <div className="p-10 text-center text-gray-500" dir="rtl">נדרשת התחברות.</div>;
  if (loading) return <div className="p-10 text-center text-gray-400" dir="rtl">טוען…</div>;

  // כבר הגיש בקשה — מציג סטטוס
  if (profile) {
    const approved = profile.status === 'approved';
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full p-8 text-center">
          {approved
            ? <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            : <Clock className="w-16 h-16 text-amber-500 mx-auto mb-4" />}
          <h2 className="text-2xl font-bold mb-2">{approved ? 'הפרופיל שלך מאושר!' : 'הבקשה בבדיקה'}</h2>
          <p className="text-gray-500 mb-6">
            {approved ? 'אתה מופיע כעת בקטלוג המומחים. אפשר לעבור ללוח הבקרה.' : 'צוות ה-Trust & Safety בודק את הפרטים. נעדכן אותך עם האישור.'}
          </p>
          <button onClick={onComplete} className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors">
            מעבר ללוח הבקרה
          </button>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!form.displayName.trim()) { setErr('יש להזין שם לתצוגה'); return; }
    if (!(Number(form.rate) > 0)) { setErr('יש להזין תעריף חוקי (גדול מ-0)'); return; }
    if (!agreed) { setErr('יש לאשר את תנאי השימוש כדי להצטרף'); return; }
    setBusy(true); setErr('');
    try {
      await setDoc(doc(db, 'providers', user.uid), {
        displayName: form.displayName || user.displayName || 'מומחה',
        category: form.category,
        rate: Number(form.rate) || 0,
        bio: form.bio,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        rating: '5.0',
        isOnline: false,
        status: 'pending',
        ownerEmail: user.email || null,
        createdAt: Date.now(),
      });
      setProfile({ status: 'pending' });
    } catch (e2) {
      setErr('שמירה נכשלה: ' + (e2?.code || e2?.message));
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden">
        <div className="bg-blue-900 text-white p-6 text-center">
          <ShieldCheck className="w-12 h-12 text-teal-400 mx-auto mb-2" />
          <h2 className="text-xl font-bold">הרשמת מומחה</h2>
          <p className="text-blue-200 text-xs mt-1">הפרופיל יעבור אישור לפני שיופיע בקטלוג</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <Field label="שם לתצוגה"><input required maxLength={60} value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="תחום">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500">
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="תעריף לשעה (₪)"><input type="number" min="1" max="10000" required value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500" /></Field>
          </div>
          <Field label="תיאור קצר"><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={500} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 resize-none" /></Field>
          <Field label="תגיות (מופרדות בפסיק)"><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="חרדה, זוגיות" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500" /></Field>
          <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer bg-gray-50 border border-gray-200 rounded-xl p-3">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-teal-600" />
            <span>אני מצהיר/ה כי אני ספק/ית עצמאי/ת האחראי/ת בלעדית לשירותיי, לרישיונותיי ולעמידה בכל דין, ומאשר/ת את <b>תנאי השימוש והתקנון</b> ואת <b>מדיניות הפרטיות</b>.</span>
          </label>
          {err && <p className="text-red-500 text-sm text-center">{err}</p>}
          <button type="submit" disabled={busy} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
            {busy ? 'שולח…' : 'שלח בקשת הצטרפות'}
          </button>
        </form>
      </div>
    </div>
  );
}

// =========================================================
// פאנל אדמין — אישור מומחים (Trust & Safety)
// =========================================================
export function AdminPanel({ user }) {
  const [providers, setProviders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'providers'), (snap) => {
      setProviders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db || !isAdminUser(user)) return;
    const unsub = onSnapshot(collection(db, 'alerts'), (snap) => {
      setAlerts(snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    }, () => {});
    return () => unsub();
  }, [user]);

  if (!isAdminUser(user)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-gray-100">
          <Lock className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">אזור מנהלים</h2>
          <p className="text-gray-500">הכניסה מוגבלת למנהלי המערכת בלבד. התחבר עם חשבון המנהל.</p>
        </div>
      </div>
    );
  }

  const setStatus = async (id, status) => {
    setBusyId(id);
    try { await updateDoc(doc(db, 'providers', id), { status }); }
    catch (e) { alert('פעולה נכשלה: ' + (e?.code || e?.message)); }
    finally { setBusyId(null); }
  };

  const removeProvider = async (id, name) => {
    if (!window.confirm(`להסיר לצמיתות את "${name}"? פרופיל המומחה יימחק מהקטלוג.`)) return;
    setBusyId(id);
    try { await deleteDoc(doc(db, 'providers', id)); }
    catch (e) { alert('הסרה נכשלה: ' + (e?.code || e?.message)); }
    finally { setBusyId(null); }
  };

  const pending = providers.filter((p) => p.status === 'pending');
  const approved = providers.filter((p) => p.status === 'approved');

  return (
    <div className="min-h-[70vh] max-w-4xl mx-auto p-4 md:p-8" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-red-100 w-12 h-12 rounded-xl flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-red-600" /></div>
        <div>
          <h1 className="text-2xl font-bold">פאנל Trust &amp; Safety</h1>
          <p className="text-gray-500 text-sm">אישור מומחים וניהול הקטלוג</p>
        </div>
      </div>

      {/* יומן התראות בטיחות */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> התראות בטיחות ({alerts.length})</h3>
        {alerts.length === 0 ? (
          <p className="text-gray-400 text-sm">אין התראות בטיחות.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.slice(0, 30).map((a) => (
              <div key={a.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm border ${a.type === 'distress' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.type === 'distress' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  {a.type === 'distress' ? <AlertTriangle className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-gray-800">{a.type === 'distress' ? 'כפתור מצוקה — מטפל' : `מילת מפתח: "${a.keyword}"`}</div>
                  <div className="text-gray-400 text-xs truncate">{a.note} · חדר {a.sessionId} · {new Date(a.createdAt).toLocaleString('he-IL')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-500" /> ממתינים לאישור ({pending.length})</h3>
      <div className="space-y-3 mb-8">
        {pending.length === 0 && <div className="text-gray-400 text-sm bg-white rounded-xl border border-gray-100 p-6 text-center">אין בקשות ממתינות.</div>}
        {pending.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-bold text-gray-900">{p.displayName}</div>
              <div className="text-gray-500 text-sm">{CATEGORIES.find((c) => c.id === p.category)?.name || p.category} · ₪{p.rate}/שעה · {p.ownerEmail}</div>
              {p.bio && <div className="text-gray-400 text-xs mt-1 truncate">{p.bio}</div>}
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setStatus(p.id, 'approved')} disabled={busyId === p.id} className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1 disabled:opacity-50"><CheckCircle className="w-4 h-4" /> אשר</button>
              <button onClick={() => setStatus(p.id, 'rejected')} disabled={busyId === p.id} className="bg-gray-100 hover:bg-red-50 text-red-500 text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1 disabled:opacity-50"><XCircle className="w-4 h-4" /> דחה</button>
              <button onClick={() => removeProvider(p.id, p.displayName)} disabled={busyId === p.id} className="text-gray-400 hover:text-red-600 text-sm font-bold px-2 disabled:opacity-50" title="הסר לצמיתות">הסר</button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> מומחים מאושרים ({approved.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {approved.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
            <div><div className="font-bold text-gray-800">{p.displayName}</div><div className="text-gray-400 text-xs">{CATEGORIES.find((c) => c.id === p.category)?.name || p.category}</div></div>
            <div className="flex gap-3">
              <button onClick={() => setStatus(p.id, 'pending')} className="text-xs text-gray-400 hover:text-amber-600">השהה</button>
              <button onClick={() => removeProvider(p.id, p.displayName)} className="text-xs text-gray-400 hover:text-red-600">הסר</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================================
// הגדרות חשבון — כולל מחיקת חשבון (זכות להימחק)
// =========================================================
export function AccountSettings({ user, onDeleted }) {
  const [busy, setBusy] = useState(false);
  if (!user) return <div className="p-10 text-center text-gray-500" dir="rtl">נדרשת התחברות.</div>;

  const del = async () => {
    if (!window.confirm('למחוק את חשבונך לצמיתות? הפעולה בלתי הפיכה ותמחק את הפרופיל שלך.')) return;
    setBusy(true);
    try { await deleteAccount(); onDeleted && onDeleted(); }
    catch (e) {
      if (e?.code === 'auth/requires-recent-login') alert('מטעמי אבטחה יש להתחבר מחדש לפני מחיקת החשבון. התנתק, התחבר שוב, ונסה שוב.');
      else alert('מחיקה נכשלה: ' + (e?.code || e?.message));
    } finally { setBusy(false); }
  };

  return (
    <div dir="rtl" className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full p-8">
        <h2 className="text-xl font-bold mb-1">הגדרות חשבון</h2>
        <p className="text-gray-500 text-sm mb-6">{user.displayName || user.email || 'משתמש'}</p>

        <div className="border border-red-200 bg-red-50 rounded-2xl p-5">
          <h3 className="font-bold text-red-700 mb-1">מחיקת חשבון</h3>
          <p className="text-red-600 text-sm mb-4">מחיקה לצמיתות של החשבון והפרופיל שלך. פעולה בלתי הפיכה.</p>
          <button onClick={del} disabled={busy} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl disabled:opacity-50">
            {busy ? 'מוחק…' : 'מחק את חשבוני'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- עזרים ----
function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" /></svg>
  );
}

function translateAuthError(code) {
  const map = {
    'auth/invalid-email': 'כתובת אימייל לא תקינה',
    'auth/user-not-found': 'משתמש לא נמצא',
    'auth/wrong-password': 'סיסמה שגויה',
    'auth/invalid-credential': 'אימייל או סיסמה שגויים',
    'auth/email-already-in-use': 'האימייל כבר רשום — התחבר במקום',
    'auth/weak-password': 'סיסמה חלשה מדי (6+ תווים)',
    'auth/popup-closed-by-user': 'החלון נסגר לפני השלמת ההתחברות',
    'auth/popup-blocked': 'הדפדפן חסם את חלון ההתחברות — אפשר חלונות קופצים',
  };
  return map[code] || 'שגיאת התחברות. נסה שוב.';
}
