import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, Clock, PhoneCall, Video, ChevronRight, MessageSquare } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';
import { canSos } from './lib/config.js';

const CATEGORY_NAMES = {
  psychology: 'פסיכולוגיה', law: 'משפט ועריכת דין', sleep: 'ייעוץ שינה והורות',
  addiction: 'גמילה', finance: 'ייעוץ פיננסי', gaming: 'חוגי משחק', mysticism: 'רוחניות ותקשור',
};

export default function ExpertProfile({ expert, onBook, onBack }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!expert?.id || !db) return;
    const q = query(collection(db, 'reviews'), where('providerId', '==', expert.id));
    const unsub = onSnapshot(q, (s) => {
      setReviews(s.docs.map((d) => d.data()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    }, () => {});
    return () => unsub();
  }, [expert]);

  if (!expert) return null;
  const avg = reviews.length ? (reviews.reduce((a, r) => a + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1) : expert.rating;
  const sos = canSos(expert);

  return (
    <div dir="rtl" className="min-h-[70vh] bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-6">
        <button onClick={onBack} className="text-gray-500 hover:text-blue-900 text-sm font-bold mb-4 flex items-center gap-1"><ChevronRight className="w-4 h-4" /> חזרה לקטלוג</button>

        {/* כרטיס ראשי */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-blue-900 h-24 relative">
            {expert.isOnline && <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5"><span className="w-2 h-2 bg-white rounded-full animate-pulse" /> זמין עכשיו</span>}
          </div>
          <div className="px-6 md:px-8 pb-8 -mt-12">
            <div className="w-24 h-24 bg-blue-100 text-blue-700 rounded-2xl border-4 border-white flex items-center justify-center text-4xl font-bold shadow-sm">{(expert.displayName || '?').charAt(0)}</div>
            <div className="flex flex-wrap items-start justify-between gap-4 mt-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">{expert.displayName} <ShieldCheck className="w-5 h-5 text-teal-500" title="מאומת" /></h1>
                <p className="text-gray-500">{CATEGORY_NAMES[expert.category] || expert.category}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1 text-amber-500 font-bold"><Star className="w-4 h-4 fill-current" /> {avg} {reviews.length > 0 && <span className="text-gray-400 font-normal">({reviews.length})</span>}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 45 דק׳</span>
                </div>
              </div>
              <div className="text-left">
                <div className="text-2xl font-black text-teal-600">₪{expert.rate}</div>
                <div className="text-gray-400 text-xs">לשעה</div>
              </div>
            </div>

            {expert.bio && <p className="text-gray-600 leading-relaxed mt-5">{expert.bio}</p>}

            {Array.isArray(expert.tags) && expert.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {expert.tags.map((t, i) => <span key={i} className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">{t}</span>)}
              </div>
            )}

            {/* כפתורי הזמנה */}
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              {sos ? (
                <button onClick={() => onBook('sos')} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-500/20"><PhoneCall className="w-5 h-5" /> שיחת SOS מיידית (+30%)</button>
              ) : expert.isOnline ? (
                <button onClick={() => onBook('scheduled')} className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"><Video className="w-5 h-5" /> התחל שיחה</button>
              ) : (
                <button onClick={() => onBook('scheduled')} className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"><Video className="w-5 h-5" /> תאם פגישה</button>
              )}
            </div>
          </div>
        </div>

        {/* ביקורות */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-teal-500" /> ביקורות ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">אין עדיין ביקורות למומחה זה.</p>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 20).map((r, i) => (
                <div key={i} className="border-b border-gray-50 pb-3 last:border-0">
                  <div className="flex items-center gap-1 text-amber-400 mb-1">
                    {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-current' : 'text-gray-200'}`} />)}
                  </div>
                  {r.comment && <p className="text-gray-600 text-sm">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
