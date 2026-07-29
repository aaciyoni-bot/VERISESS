import React, { useState, useEffect } from 'react';
import { Video, Star, Clock, CheckCircle, Calendar, X, MessageCircle } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { googleCalendarUrl } from './lib/notify.js';
import ChatThread from './ChatThread.jsx';

export default function MySessions({ user, onEnterRoom, onFindExpert }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFor, setRatingFor] = useState(null);
  const [chatWith, setChatWith] = useState(null);

  useEffect(() => {
    if (!user || !db) { setLoading(false); return; }
    const q = query(collection(db, 'bookings'), where('clientId', '==', user.uid));
    const unsub = onSnapshot(q, (s) => {
      setBookings(s.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [user]);

  const fmtDate = (ts) => { try { return new Date(ts).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return ''; } };

  return (
    <div dir="rtl" className="min-h-[70vh] bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">הפגישות שלי</h1>
        <p className="text-gray-500 mb-8">היסטוריית הפגישות שלך, כניסה חוזרת ודירוג מומחים.</p>

        {loading ? (
          <p className="text-gray-400">טוען…</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <Calendar className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-bold mb-2">עדיין אין לך פגישות</p>
            <p className="text-gray-400 text-sm mb-6">מצא מומחה והתחל פגישה מאובטחת.</p>
            <button onClick={onFindExpert} className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-3 rounded-xl">מצא מומחה</button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 flex items-center gap-2">
                    {b.providerName || 'מומחה'}
                    {b.status === 'paid' && <span className="text-green-600 bg-green-50 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> שולם</span>}
                  </div>
                  <div className="text-gray-500 text-sm flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {fmtDate(b.createdAt)}</span>
                    <span>₪{b.amount}</span>
                    {b.rated && <span className="flex items-center gap-1 text-amber-500"><Star className="w-3.5 h-3.5 fill-current" /> {b.ratingValue}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => onEnterRoom(b)} className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1"><Video className="w-4 h-4" /> לחדר</button>
                  {b.providerId && <button onClick={() => setChatWith({ uid: b.providerId, name: b.providerName || 'מומחה' })} className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1"><MessageCircle className="w-4 h-4" /> צ׳אט</button>}
                  {b.slotStart && (
                    <a href={googleCalendarUrl({ title: `פגישת VeriSess עם ${b.providerName || 'מומחה'}`, startMs: b.slotStart })} target="_blank" rel="noreferrer" className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1"><Calendar className="w-4 h-4" /> יומן</a>
                  )}
                  {!b.rated && <button onClick={() => setRatingFor(b)} className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-1"><Star className="w-4 h-4" /> דרג</button>}
                </div>
                {b.summary && <div className="w-full bg-teal-50 border border-teal-100 rounded-xl p-3 text-sm text-gray-700"><span className="font-bold text-teal-700">סיכום מהמומחה: </span>{b.summary}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {ratingFor && <RatingModal booking={ratingFor} user={user} onClose={() => setRatingFor(null)} />}
      {chatWith && <ChatThread user={user} otherUid={chatWith.uid} otherName={chatWith.name} onClose={() => setChatWith(null)} />}
    </div>
  );
}

function RatingModal({ booking, user, onClose }) {
  const [stars, setStars] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        providerId: booking.providerId, providerName: booking.providerName || '',
        clientId: user.uid, rating: stars, comment: comment.trim(),
        bookingId: booking.id, createdAt: Date.now(),
      });
      await updateDoc(doc(db, 'bookings', booking.id), { rated: true, ratingValue: stars });
      onClose();
    } catch (e) { alert('שמירת הדירוג נכשלה: ' + (e?.code || e?.message)); }
    finally { setBusy(false); }
  };

  return (
    <div dir="rtl" className="fixed inset-0 bg-black/50 z-[9990] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">דירוג {booking.providerName}</h3>
          <button onClick={onClose} aria-label="סגירה" className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex justify-center gap-1 mb-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setStars(n)} aria-label={`${n} כוכבים`}>
              <Star className={`w-9 h-9 transition-colors ${(hover || stars) >= n ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="ספר על החוויה (לא חובה)…" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 resize-none text-sm mb-4" />
        <button onClick={submit} disabled={busy} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
          {busy ? 'שולח…' : 'שלח דירוג'}
        </button>
      </div>
    </div>
  );
}
