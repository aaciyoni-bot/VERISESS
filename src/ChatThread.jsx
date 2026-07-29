import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { threadId, subscribeThread, sendChat } from './lib/chat.js';

export default function ChatThread({ user, otherUid, otherName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);
  const tid = user && otherUid ? threadId(user.uid, otherUid) : null;

  useEffect(() => { if (tid) return subscribeThread(tid, setMessages); }, [tid]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !tid) return;
    const t = text; setText('');
    try { await sendChat({ tid, fromUid: user.uid, participants: [user.uid, otherUid], text: t }); }
    catch (err) { alert('שליחה נכשלה: ' + (err?.code || err?.message)); setText(t); }
  };

  return (
    <div dir="rtl" className="fixed inset-0 bg-black/50 z-[9990] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[70vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-900 text-white px-5 py-3 flex items-center justify-between">
          <span className="font-bold flex items-center gap-2"><MessageCircle className="w-5 h-5" /> {otherName || 'צ׳אט'}</span>
          <button onClick={onClose} aria-label="סגירה"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {messages.length === 0 && <p className="text-gray-400 text-sm text-center mt-10">אין הודעות עדיין. פתח שיחה.</p>}
          {messages.map((m) => {
            const mine = m.fromUid === user.uid;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm shadow-sm ${mine ? 'bg-teal-500 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>{m.text}</div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <form onSubmit={submit} className="p-3 border-t border-gray-100 flex gap-2 bg-white">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="הקלד הודעה…" className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-teal-500" />
          <button type="submit" className="bg-teal-500 hover:bg-teal-600 text-white p-2.5 rounded-full"><Send className="w-4 h-4" /></button>
        </form>
      </div>
    </div>
  );
}
