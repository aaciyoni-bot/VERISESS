import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, CreditCard, Check, AlertTriangle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { TRANZILA_CONFIGURED, buildTranzilaUrl } from './lib/config.js';

// =========================================================
// צ'קאאוט אמיתי — סליקת טרנזילה (דף מתארח ב-iframe)
// =========================================================
export default function Checkout({ expert, user, sessionType = 'scheduled', onCancel, onSuccess }) {
  const [phase, setPhase] = useState('summary'); // summary | pay | done | error
  const [error, setError] = useState('');
  const processedRef = useRef(false);

  const amount = Number(expert?.rate) || 0;
  const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/tranzila-return.html` : '';

  // מאזין להודעת ההצלחה מדף החזרה של טרנזילה (postMessage)
  useEffect(() => {
    if (phase !== 'pay') return;
    const handler = async (event) => {
      const m = event.data;
      if (!m || m.source !== 'tranzila' || processedRef.current) return;
      processedRef.current = true;
      if (m.success) {
        try {
          const sessionId = await createBooking(m.data);
          setPhase('done');
          // מעבר לחדר לאחר רגע
          setTimeout(() => onSuccess && onSuccess(sessionId), 1200);
        } catch (e) {
          setError('התשלום התקבל אך יצירת הפגישה נכשלה: ' + (e?.code || e?.message));
          setPhase('error');
        }
      } else {
        setError('התשלום לא אושר. נסה שוב או בכרטיס אחר.');
        setPhase('error');
        processedRef.current = false;
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [phase]);

  async function createBooking(txData) {
    const sessionId = `sess_${Date.now()}`;
    await addDoc(collection(db, 'bookings'), {
      clientId: user?.uid || 'guest',
      clientEmail: user?.email || null,
      providerId: expert?.id || null,
      providerName: expert?.displayName || '',
      category: expert?.category || null,
      amount,
      sessionType,
      sessionId,
      status: 'paid',
      tranzila: txData ? { confirmation: txData.ConfirmationCode || txData.index || null, response: txData.Response || null } : null,
      createdAt: Date.now(),
    });
    return sessionId;
  }

  // ---- מסך סיכום ההזמנה ----
  if (phase === 'summary') {
    return (
      <Shell onCancel={onCancel}>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-2xl font-bold">
              {(expert?.displayName || '?').charAt(0)}
            </div>
            <div>
              <div className="font-bold text-gray-900">{expert?.displayName || 'מומחה'}</div>
              <div className="text-gray-500 text-sm">פגישת וידאו מאובטחת · 45 דק'</div>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
            <span className="font-bold text-gray-700">סכום לתשלום:</span>
            <span className="font-black text-2xl text-blue-900">₪{amount}</span>
          </div>
          {!TRANZILA_CONFIGURED ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="font-bold text-amber-800 text-sm">הסליקה בהקמה</p>
              <p className="text-amber-700 text-xs mt-1">מסוף טרנזילה טרם הוגדר. לאחר הגדרת ה-Supplier התשלום יעבוד באופן מלא.</p>
            </div>
          ) : (
            <button onClick={() => setPhase('pay')} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md">
              <CreditCard className="w-5 h-5" /> מעבר לתשלום מאובטח
            </button>
          )}
          <p className="text-center text-gray-400 text-xs flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> התשלום מתבצע בדף המאובטח של טרנזילה (PCI DSS)
          </p>
        </div>
      </Shell>
    );
  }

  // ---- שלב הסליקה (iframe של טרנזילה) ----
  if (phase === 'pay') {
    const url = buildTranzilaUrl({
      sum: amount,
      description: `פגישת VeriSess עם ${expert?.displayName || 'מומחה'}`,
      email: user?.email || undefined,
      returnUrl,
    });
    return (
      <Shell onCancel={onCancel} wide>
        <iframe title="תשלום מאובטח — טרנזילה" src={url} className="w-full h-[560px] border-0" allow="payment" />
      </Shell>
    );
  }

  // ---- הצלחה ----
  if (phase === 'done') {
    return (
      <Shell>
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-green-600" /></div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">התשלום בוצע בהצלחה!</h3>
          <p className="text-gray-500">מכניס אותך לחדר…</p>
        </div>
      </Shell>
    );
  }

  // ---- שגיאה ----
  return (
    <Shell onCancel={onCancel}>
      <div className="p-10 text-center">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">התשלום לא הושלם</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => { setPhase('summary'); setError(''); }} className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800">נסה שוב</button>
      </div>
    </Shell>
  );
}

function Shell({ children, onCancel, wide }) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4" dir="rtl">
      <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        <div className="bg-gray-900 p-6 text-white text-center relative">
          {onCancel && <button onClick={onCancel} className="absolute right-4 top-4 text-gray-400 hover:text-white text-sm font-bold">חזור</button>}
          <ShieldCheck className="w-12 h-12 text-teal-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold">תשלום מאובטח</h2>
          <p className="text-gray-400 text-xs mt-1">סליקה מוצפנת דרך טרנזילה</p>
        </div>
        {children}
      </div>
    </div>
  );
}
