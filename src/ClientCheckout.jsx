import React, { useState } from 'react';
import { ShieldCheck, Check, Lock, Loader2 } from 'lucide-react';

export default function ClientCheckout({ expertId, onCancel, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2000);
  };

  const handleEnterRoom = () => {
    if (onSuccess) {
      onSuccess(`sess_${Date.now()}`); 
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100" dir="rtl">
      <div className="bg-gray-900 p-6 text-white text-center relative">
        {onCancel && (
          <button onClick={onCancel} className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors text-sm font-bold">
            חזור לקטלוג
          </button>
        )}
        <ShieldCheck className="w-12 h-12 text-teal-500 mx-auto mb-2" />
        <h2 className="text-xl font-bold">הפקדה מאובטחת</h2>
        <p className="text-gray-400 text-xs mt-1">הסכום יישמר בנאמנות (Escrow) עד סיום הפגישה</p>
      </div>

      {step < 3 && (
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 flex justify-between items-center">
                <span className="font-bold text-gray-700">סכום לתשלום:</span>
                <span className="font-black text-2xl text-blue-900">₪250</span>
              </div>
              <div className="space-y-3">
                <input type="text" placeholder="שם בעל הכרטיס" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500" />
                <input type="text" placeholder="מספר כרטיס אשראי" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500" />
                <div className="flex gap-2">
                  <input type="text" placeholder="MM/YY" className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500" />
                  <input type="text" placeholder="CVV" className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500" />
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 shadow-md"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'אשר הפקדה'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="w-16 h-16 text-teal-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600 font-bold">מעבד תשלום מאובטח...</p>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">התשלום בוצע בהצלחה!</h3>
          <p className="text-gray-500 mb-8">הגישה לחדר נפתחה.</p>
          <button onClick={handleEnterRoom} className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-colors shadow-md">
            היכנס לחדר עכשיו
          </button>
        </div>
      )}

      <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs font-bold">
          <Lock className="w-3 h-3" />
          <span>העסקה מאובטחת בטכנולוגיית הצפנה 256-bit</span>
        </div>
      </div>
    </div>
  );
}
