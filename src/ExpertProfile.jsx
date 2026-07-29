import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, Clock, PhoneCall, Video, ChevronRight, MessageSquare, EyeOff, X, Lock } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';
import { canSos, canAnon } from './lib/config.js';

const CATEGORY_NAMES = {
  psychology: 'פסיכולוגיה', law: 'משפט ועריכת דין', sleep: 'ייעוץ שינה והורות',
  addiction: 'גמילה', finance: 'ייעוץ פיננסי', gaming: 'חוגי משחק', mysticism: 'רוחניות ותקשור',
};

export default function ExpertProfile({ expert, onBook, onBack }) {
  const [reviews, setReviews] = useState([]);
  const [anon, setAnon] = useState(false);
  const [showAnonInfo, setShowAnonInfo] = useState(false);

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

            {/* מצב אנונימי — רק בקטגוריות רגישות */}
            {canAnon(expert) && (
              <button
                onClick={() => { if (!anon) setShowAnonInfo(true); else setAnon(false); }}
                className={`w-full mt-6 flex items-center justify-between gap-3 rounded-2xl border p-4 transition-colors text-right ${anon ? 'bg-blue-900 border-blue-900 text-white' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
              >
                <span className="flex items-center gap-3">
                  <EyeOff className={`w-5 h-5 ${anon ? 'text-teal-300' : 'text-gray-400'}`} />
                  <span>
                    <span className="block font-bold text-sm">ייעוץ במצב אנונימי</span>
                    <span className={`block text-xs ${anon ? 'text-blue-200' : 'text-gray-500'}`}>{anon ? 'מופעל — המומחה לא יראה את זהותך' : 'המומחה לא יראה את שמך ופרטיך'}</span>
                  </span>
                </span>
                <span className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${anon ? 'bg-teal-400' : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${anon ? 'right-0.5' : 'right-[22px]'}`} />
                </span>
              </button>
            )}

            {/* כפתורי הזמנה */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              {sos ? (
                <button onClick={() => onBook('sos', anon)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-500/20"><PhoneCall className="w-5 h-5" /> שיחת SOS מיידית (+30%)</button>
              ) : expert.isOnline ? (
                <button onClick={() => onBook('scheduled', anon)} className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"><Video className="w-5 h-5" /> התחל שיחה</button>
              ) : (
                <button onClick={() => onBook('scheduled', anon)} className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"><Video className="w-5 h-5" /> תאם פגישה</button>
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

      {/* מודל הסבר — נפתח בהפעלת מצב אנונימי */}
      {showAnonInfo && (
        <div className="fixed inset-0 bg-black/50 z-[9990] flex items-center justify-center p-4" onClick={() => setShowAnonInfo(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><EyeOff className="w-5 h-5 text-blue-900" /> מצב אנונימי — איך זה עובד</h3>
              <button onClick={() => setShowAnonInfo(false)} aria-label="סגירה" className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p className="flex gap-2"><ShieldCheck className="w-5 h-5 text-teal-500 shrink-0" /> <span><b>כלפי המומחה — אנונימי לחלוטין.</b> המומחה לא יראה את שמך, האימייל שלך או פרטי ההרשמה — רק כינוי כללי ("לקוח אנונימי").</span></p>
              <p className="flex gap-2"><Lock className="w-5 h-5 text-amber-500 shrink-0" /> <span><b>שקיפות מלאה:</b> מנהל האתר עדיין נחשף לפרטים שמסרת בהרשמה ולאמצעי התשלום — זה הכרחי לתפעול, לסליקה ולמניעת הונאות. האנונימיות אינה כלפי הפלטפורמה, אלא כלפי המומחה בלבד.</span></p>
              <p className="text-gray-400 text-xs">שיחת הווידאו והצ׳אט מוצפנים מקצה לקצה בכל מקרה.</p>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => { setAnon(true); setShowAnonInfo(false); }} className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-xl">הפעל מצב אנונימי</button>
              <button onClick={() => setShowAnonInfo(false)} className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl">ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
