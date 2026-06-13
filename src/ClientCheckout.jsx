import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { 
  ShieldCheck, Lock, CreditCard, ChevronRight, 
  Smartphone, CheckCircle2, AlertTriangle, PhoneCall 
} from 'lucide-react';

// ==========================================
// 1. חיבורים (Firebase + תשתית מפתחות)
// ==========================================
let app, auth, db, appId;

try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = typeof __app_id !== 'undefined' ? __app_id : 'verisess-dev-id';
} catch (error) {
  console.error("Firebase Init Error:", error);
}

// במערכת פרודקשן אמיתית, ה-Publishable Key של Stripe היה נשמר במשתני סביבה (.env)
// כאן נשתמש בו לצורך הדגמת הזרקת המפתח שלקחת מהדשבורד
const STRIPE_PUBLISHABLE_KEY = "pk_test_51...YOUR_KEY_HERE..."; 

// ==========================================
// 2. קומפוננטת סליקה ואישור (Checkout)
// ==========================================
export default function ClientCheckout({ expertId, onCancel, onSuccess }) {
  const [expert, setExpert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // משיכת פרטי המומחה הספציפי ממסד הנתונים
  useEffect(() => {
    const fetchExpertDetails = async () => {
      if (!expertId || !db) return;
      
      try {
        const expertRef = doc(db, 'artifacts', appId, 'public', 'data', 'providers', expertId);
        const docSnap = await getDoc(expertRef);
        
        if (docSnap.exists()) {
          setExpert({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("המומחה לא נמצא במערכת.");
        }
      } catch (err) {
        console.error("Error fetching expert:", err);
        setError("שגיאה בטעינת נתוני המומחה.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpertDetails();
  }, [expertId]);

  // לוגיקת תשלום ויצירת סשן (הפעולה המרכזית)
  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    // השלב הזה בפרודקשן יקרא ל-Stripe JS SDK עם פרטי האשראי:
    // const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    // const { error, paymentIntent } = await stripe.confirmCardPayment(...)

    // סימולציה של סליקה - המתנה של 2.5 שניות
    setTimeout(async () => {
      try {
        // 1. יצירת סשן פגישה חי ב-Firebase לאחר שהתשלום "אושר"
        const currentUser = auth?.currentUser;
        const sessionId = `sess_${Date.now()}`;
        
        if (currentUser && db) {
           const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
           await setDoc(sessionRef, {
             providerId: expert.id,
             clientId: currentUser.uid,
             status: 'active', // מחכה שהמטפל יכנס
             paymentStatus: 'authorized', // הכסף משוריין
             amount: expert.rate,
             messages: [],
             createdAt: new Date().toISOString()
           });
           
           // 2. הפעלת הפונקציה שאומרת לאפליקציה "התשלום הצליח, תעביר אותי לוידאו!"
           if (onSuccess) onSuccess(sessionId);
        } else {
           throw new Error("משתמש לא מחובר.");
        }
      } catch (err) {
        console.error("Payment flow error:", err);
        setError("אירעה שגיאה בעיבוד התשלום או ביצירת הפגישה.");
        setIsProcessing(false);
      }
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center" dir="rtl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="font-bold text-gray-800 text-lg mb-2">שגיאה בטעינת הנתונים</h3>
        <p className="text-gray-500 text-sm mb-6">{error}</p>
        <button onClick={onCancel} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200">חזור לחיפוש</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative" dir="rtl">
      
      {/* כפתור חזור */}
      <button 
        onClick={onCancel} 
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10 flex items-center gap-1 bg-white/80 px-2 py-1 rounded-md text-sm"
      >
        <ChevronRight className="w-4 h-4" /> ביטול
      </button>

      {/* Header קופה */}
      <div className="bg-gradient-to-b from-blue-50 to-white pt-10 pb-6 px-6 text-center border-b border-gray-100">
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
          <Lock className="w-8 h-8 text-teal-500" />
        </div>
        <h2 className="text-2xl font-bold text-blue-900 mb-1">תשלום מאובטח</h2>
        <p className="text-sm text-gray-500 font-medium">הסכום ישוריין בלבד ויחויב רק לאחר השיחה.</p>
      </div>

      <div className="p-6">
        
        {/* פרטי המומחה והעסקה */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
            <span className="text-gray-500 font-medium text-sm">סיכום הזמנה</span>
            <span className="text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded text-xs flex items-center gap-1">
              <PhoneCall className="w-3 h-3" /> קריאת SOS
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <img 
              src={expert.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.displayName)}&background=0D8ABC&color=fff`} 
              alt={expert.displayName} 
              className="w-14 h-14 rounded-xl object-cover border border-gray-100" 
            />
            <div className="flex-1">
              <div className="font-bold text-gray-800">{expert.displayName}</div>
              <div className="text-xs text-gray-500">{expert.category}</div>
            </div>
            <div className="text-left">
              <div className="font-black text-2xl text-blue-900">₪{expert.rate}</div>
              <div className="text-[10px] text-gray-400">עד 45 דקות</div>
            </div>
          </div>
        </div>

        {/* הודעת שגיאה בתשלום (אם יש) */}
        {error && (
           <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
             <AlertTriangle className="w-5 h-5 flex-shrink-0" />
             <span>{error}</span>
           </div>
        )}

        <h3 className="font-bold text-gray-700 mb-4 text-sm">בחר אמצעי תשלום</h3>
        
        {/* אפשרויות תשלום */}
        <div className="space-y-3 mb-8">
          
          {/* Apple/Google Pay */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setPaymentMethod('apple_pay')}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${paymentMethod === 'apple_pay' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'}`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="font-bold">Apple Pay</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('google_pay')}
              className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${paymentMethod === 'google_pay' ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'}`}
            >
              <span className="font-bold">Google Pay</span>
            </button>
          </div>

          {/* כרטיס אשראי */}
          <button 
            onClick={() => setPaymentMethod('credit_card')}
            className={`w-full flex items-center justify-between py-4 px-4 rounded-xl border-2 transition-all ${paymentMethod === 'credit_card' ? 'border-teal-500 bg-teal-50 text-teal-800' : 'border-gray-200 bg-white text-gray-600'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${paymentMethod === 'credit_card' ? 'bg-white text-teal-500 shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="text-right">
                <span className="font-bold block">כרטיס אשראי</span>
                <span className="text-xs opacity-80">תשלום מאובטח ע"י Stripe</span>
              </div>
            </div>
            {paymentMethod === 'credit_card' && <CheckCircle2 className="w-6 h-6 text-teal-500" />}
          </button>
        </div>

        {/* טופס אשראי מדומה (יוצג רק אם נבחר אשראי) */}
        {paymentMethod === 'credit_card' && (
          <div className="mb-8 space-y-4 animate-in fade-in slide-in-from-top-2">
             <div>
               <input type="text" placeholder="מספר כרטיס (0000 0000 0000 0000)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-left" dir="ltr" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <input type="text" placeholder="תוקף (MM/YY)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-center" dir="ltr" />
               <input type="text" placeholder="CVC" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-center" dir="ltr" />
             </div>
          </div>
        )}

        {/* כפתור תשלום מרכזי */}
        <button 
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex justify-center items-center gap-2 ${isProcessing ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 active:scale-95'}`}
        >
          {isProcessing ? (
             <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              מבצע שריון כספים...
             </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              אשר והיכנס לשיחה 
            </>
          )}
        </button>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
           <ShieldCheck className="w-4 h-4" />
           <span className="text-xs font-medium">סליקה מוצפנת ומאובטחת (PCI-DSS)</span>
        </div>
      </div>
    </div>
  );
}
