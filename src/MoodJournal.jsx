import React, { useState, useEffect } from 'react';
import { HeartPulse, Plus } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from './firebase.js';

const MOODS = [
  { v: 1, emoji: '😞', label: 'קשה מאוד', color: 'bg-red-100 text-red-600 border-red-200' },
  { v: 2, emoji: '😕', label: 'לא משהו', color: 'bg-orange-100 text-orange-600 border-orange-200' },
  { v: 3, emoji: '😐', label: 'בסדר', color: 'bg-amber-100 text-amber-600 border-amber-200' },
  { v: 4, emoji: '🙂', label: 'טוב', color: 'bg-lime-100 text-lime-600 border-lime-200' },
  { v: 5, emoji: '😄', label: 'מצוין', color: 'bg-green-100 text-green-600 border-green-200' },
];

export default function MoodJournal({ user }) {
  const [entries, setEntries] = useState([]);
  const [mood, setMood] = useState(0);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db, 'journals'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (s) => {
      setEntries(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    }, () => {});
    return () => unsub();
  }, [user]);

  const save = async () => {
    if (!mood) return;
    setBusy(true);
    try {
      await addDoc(collection(db, 'journals'), { uid: user.uid, mood, note: note.trim(), createdAt: Date.now() });
      setMood(0); setNote('');
    } catch (e) { alert('שמירה נכשלה: ' + (e?.code || e?.message)); }
    finally { setBusy(false); }
  };

  const fmt = (ms) => { try { return new Date(ms).toLocaleString('he-IL', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  if (!user) return <div dir="rtl" className="p-10 text-center text-gray-500">נדרשת התחברות.</div>;

  return (
    <div dir="rtl" className="min-h-[70vh] bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2"><HeartPulse className="w-6 h-6 text-rose-500" /> היומן הרגשי שלי</h1>
        <p className="text-gray-500 mb-8">מעקב פרטי אחר מצב הרוח בין הפגישות. רק אתה רואה את זה.</p>

        {/* רשומה חדשה */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <h3 className="font-bold text-gray-700 mb-3">איך אתה מרגיש עכשיו?</h3>
          <div className="flex justify-between gap-2 mb-4">
            {MOODS.map((m) => (
              <button key={m.v} onClick={() => setMood(m.v)} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${mood === m.v ? m.color + ' scale-105' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[11px] font-bold text-gray-600">{m.label}</span>
              </button>
            ))}
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} placeholder="מה עובר עליך? (לא חובה)" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 resize-none text-sm mb-3" />
          <button onClick={save} disabled={!mood || busy} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" /> {busy ? 'שומר…' : 'הוסף רשומה'}
          </button>
        </div>

        {/* היסטוריה */}
        <h3 className="font-bold text-gray-700 mb-3">היסטוריה ({entries.length})</h3>
        {entries.length === 0 ? (
          <p className="text-gray-400 text-sm">עדיין אין רשומות. הוסף את הראשונה.</p>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => {
              const m = MOODS.find((x) => x.v === e.mood) || MOODS[2];
              return (
                <div key={e.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-3">
                  <span className="text-2xl">{m.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-gray-400">{fmt(e.createdAt)}</div>
                    {e.note && <p className="text-gray-700 text-sm mt-1">{e.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
