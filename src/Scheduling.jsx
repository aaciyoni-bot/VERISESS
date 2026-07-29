import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Clock, ChevronLeft } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';

const fmtSlot = (ms) => {
  try { return new Date(ms).toLocaleString('he-IL', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

// =========================================================
// ניהול זמינות — למומחה (בדשבורד)
// =========================================================
export function AvailabilityManager({ user }) {
  const [slots, setSlots] = useState([]);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !db) return;
    const unsub = onSnapshot(collection(db, 'providers', user.uid, 'availability'), (s) => {
      setSlots(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.start - b.start));
    }, () => {});
    return () => unsub();
  }, [user]);

  const add = async () => {
    if (!value) return;
    const start = new Date(value).getTime();
    if (!start || start < Date.now()) { alert('בחר מועד עתידי'); return; }
    setBusy(true);
    try {
      await addDoc(collection(db, 'providers', user.uid, 'availability'), { start, startISO: value, durationMin: 45, booked: false, createdAt: Date.now() });
      setValue('');
    } catch (e) { alert('הוספה נכשלה: ' + (e?.code || e?.message)); }
    finally { setBusy(false); }
  };

  const remove = async (id) => { try { await deleteDoc(doc(db, 'providers', user.uid, 'availability', id)); } catch (e) { alert(e?.code || e?.message); } };

  const upcoming = slots.filter((s) => s.start > Date.now());

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-teal-500" /> זמינות ליומן</h3>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input type="datetime-local" value={value} onChange={(e) => setValue(e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500" />
        <button onClick={add} disabled={busy} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1 disabled:opacity-50"><Plus className="w-4 h-4" /> הוסף מועד</button>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-gray-400 text-sm">לא הוגדרו מועדים פנויים. הוסף מועדים כדי לקבל פגישות מתוזמנות.</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map((s) => (
            <div key={s.id} className={`flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2 text-sm ${s.booked ? 'bg-gray-50' : 'bg-white'}`}>
              <span className="flex items-center gap-2 text-gray-700"><Clock className="w-4 h-4 text-gray-400" /> {fmtSlot(s.start)}</span>
              {s.booked
                ? <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">נתפס</span>
                : <button onClick={() => remove(s.id)} aria-label="מחיקה" className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =========================================================
// בחירת מועד — ללקוח (פגישה מתוזמנת)
// =========================================================
export function SlotPicker({ expert, onPick, onCancel }) {
  const [slots, setSlots] = useState(null);

  useEffect(() => {
    if (!expert?.id || !db) { setSlots([]); return; }
    const unsub = onSnapshot(collection(db, 'providers', expert.id, 'availability'), (s) => {
      const now = Date.now();
      setSlots(s.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => !x.booked && x.start > now).sort((a, b) => a.start - b.start));
    }, () => setSlots([]));
    return () => unsub();
  }, [expert]);

  return (
    <div dir="rtl" className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md overflow-hidden">
        <div className="bg-blue-900 text-white p-6 text-center relative">
          <button onClick={onCancel} className="absolute right-4 top-4 text-blue-200 hover:text-white text-sm font-bold">חזור</button>
          <Calendar className="w-12 h-12 text-teal-400 mx-auto mb-2" />
          <h2 className="text-xl font-bold">בחירת מועד</h2>
          <p className="text-blue-200 text-xs mt-1">{expert?.displayName} · פגישה מתוזמנת (45 דק׳)</p>
        </div>
        <div className="p-6">
          {slots === null ? (
            <p className="text-gray-400 text-center">טוען מועדים…</p>
          ) : slots.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-500 mb-6">אין כרגע מועדים פנויים אצל מומחה זה.</p>
              <button onClick={() => onPick(null)} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl">המשך להזמנה מיידית</button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {slots.map((s) => (
                <button key={s.id} onClick={() => onPick(s)} className="w-full flex items-center justify-between bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-300 rounded-xl px-4 py-3 transition-colors group">
                  <span className="flex items-center gap-2 text-gray-800 font-medium"><Clock className="w-4 h-4 text-teal-500" /> {fmtSlot(s.start)}</span>
                  <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-teal-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
