import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Calendar, Zap, Info } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase.js';

const ICONS = { booking: Calendar, sos: Zap, reminder: Calendar, system: Info };

export default function NotificationBell({ user, onNavigate }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!user || !db) { setItems([]); return; }
    const q = query(collection(db, 'notifications'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (s) => {
      setItems(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 30));
    }, () => {});
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener('mousedown', onDoc);
    return () => window.removeEventListener('mousedown', onDoc);
  }, [open]);

  const unread = items.filter((i) => !i.read).length;

  const openPanel = async () => {
    setOpen((o) => !o);
    // סימון כנקרא
    if (!open) {
      for (const i of items) if (!i.read) { try { await updateDoc(doc(db, 'notifications', i.id), { read: true }); } catch { /* noop */ } }
    }
  };

  const fmt = (ms) => { try { return new Date(ms).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button onClick={openPanel} aria-label={`התראות${unread ? ` (${unread} חדשות)` : ''}`} className="relative p-2 text-gray-500 hover:text-blue-900">
        <Bell className="w-5 h-5" />
        {unread > 0 && <span className="absolute -top-0.5 -left-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div dir="rtl" className="absolute left-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          <div className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-bold flex items-center gap-2"><Bell className="w-4 h-4" /> התראות</span>
            <button onClick={() => setOpen(false)} aria-label="סגירה"><X className="w-4 h-4" /></button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-10">אין התראות.</p>
            ) : items.map((i) => {
              const Icon = ICONS[i.type] || Info;
              return (
                <button key={i.id} onClick={() => { if (i.link) { onNavigate && onNavigate(i.link); setOpen(false); } }} className="w-full text-right flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${i.type === 'sos' ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600'}`}><Icon className="w-4 h-4" /></div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-800 text-sm">{i.title}</div>
                    {i.body && <div className="text-gray-500 text-xs mt-0.5">{i.body}</div>}
                    <div className="text-gray-300 text-[10px] mt-1">{fmt(i.createdAt)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
