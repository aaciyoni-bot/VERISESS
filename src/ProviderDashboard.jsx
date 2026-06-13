import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { ShieldCheck, DollarSign, Video, Clock, Activity, PhoneCall, AlertCircle, CreditCard, ExternalLink } from 'lucide-react';

// חיבור לפיירבייס 
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

export default function ProviderDashboard() {
  const [user, setUser] = useState(null);
  const [providerData, setProviderData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);

  // מאזין למשתמש המחובר
  useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setIsLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // מושך נתונים מהמסד
  useEffect(() => {
    if (!user || !db) return;
    
    const providerRef = doc(db, 'artifacts', appId, 'public', 'data', 'providers', user.uid);
    const unsubscribeProvider = onSnapshot(providerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProviderData(data);
        setIsOnline(data.isOnline || false);
      }
      setIsLoading(false);
    });

    const sessionsRef = collection(db, 'artifacts', appId, 'public', 'data', 'sessions');
    const unsubscribeSessions = onSnapshot(sessionsRef, (snapshot) => {
      const sessions = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(s => s.providerId === user.uid && s.status === 'active');
      setActiveSessions(sessions);
    });

    return () => {
      unsubscribeProvider();
      unsubscribeSessions();
    };
  }, [user]);

  // פעולת חיבור ל-Stripe (סימולציה של ניתוב לשרת שלנו שמייצר לינק לאונבורדינג)
  const handleConnectStripe = async () => {
    setIsConnectingStripe(true);
    // בפרודקשן: כאן תהיה קריאה לשרת (Cloud Function) שמשתמש ב-Secret Key
    // השרת יחזיר URL של Stripe ואנחנו נעשה window.location.href = url
    
    // סימולציה לצורך הפיילוט (נדמה כאילו המטפל חזר בהצלחה מ-Stripe):
    setTimeout(async () => {
      if (user && db) {
        const providerRef = doc(db, 'artifacts', appId, 'public', 'data', 'providers', user.uid);
        await setDoc(providerRef, { stripeConnected: true }, { merge: true });
        setIsConnectingStripe(false);
      }
    }, 2000);
  };

  const toggleOnlineStatus = async () => {
    if (!user || !db) return;
    
    // חסימה: אי אפשר להיות אונליין אם לא חיברת חשבון בנק!
    if (!providerData?.stripeConnected) {
      alert("עליך לחבר חשבון בנק (Stripe) לפני שתוכל לקבל שיחות בתשלום.");
      return;
    }

    const newStatus = !isOnline;
    setIsOnline(newStatus); 
    try {
      const providerRef = doc(db, 'artifacts', appId, 'public', 'data', 'providers', user.uid);
      await setDoc(providerRef, { isOnline: newStatus }, { merge: true });
    } catch (error) {
      console.error("Error updating status:", error);
      setIsOnline(!newStatus); 
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center h-full w-full bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !providerData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center p-4 bg-gray-50 h-full w-full" dir="rtl">
        <ShieldCheck className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">אזור מאובטח למטפלים בלבד</h2>
        <p className="text-gray-500">עליך להתחבר או להשלים את תהליך ההרשמה כדי לגשת ללוח הבקרה.</p>
      </div>
    );
  }

  // בדיקה אם המטפל סיים להגדיר את חשבון הבנק שלו
  const hasStripeAccount = providerData.stripeConnected;

  return (
    <div className="bg-gray-50 h-full w-full px-4 pt-8" dir="rtl">
      
      {/* אזור העליון עם מתג ה-SOS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">שלום, {providerData.displayName}</h1>
          <p className="text-gray-500">לוח הבקרה שלך מעודכן להיום.</p>
        </div>
        
        <div className={`p-4 rounded-2xl flex items-center gap-4 transition-all border-2 shadow-sm ${isOnline ? 'bg-white border-green-500' : 'bg-gray-100 border-gray-200'} ${!hasStripeAccount ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
          <div className="flex flex-col">
            <span className={`font-bold ${isOnline ? 'text-green-700' : 'text-gray-500'}`}>
              {isOnline ? 'זמין לקריאות SOS' : 'לא זמין כעת'}
            </span>
            {!hasStripeAccount && <span className="text-xs text-red-500 font-bold">נדרש חיבור חשבון בנק</span>}
          </div>
          <label className={`relative inline-flex items-center ${hasStripeAccount ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
            <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={toggleOnlineStatus} disabled={!hasStripeAccount} />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>

      {/* !!! חסימת תשלומים (Stripe Onboarding) !!! */}
      {!hasStripeAccount && (
        <div className="max-w-6xl mx-auto mb-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-yellow-100 p-3 rounded-full mt-1">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-bold text-yellow-800 text-lg">חסר אמצעי לקבלת תשלום</h3>
              <p className="text-yellow-700 text-sm mt-1 max-w-xl">
                כדי שתוכל לקבל קריאות SOS ולקבל תשלום מלקוחות, עליך לחבר את חשבון הבנק שלך באמצעות פלטפורמת הסליקה המאובטחת שלנו (Stripe). התהליך לוקח פחות מ-2 דקות.
              </p>
            </div>
          </div>
          <button 
            onClick={handleConnectStripe}
            disabled={isConnectingStripe}
            className="flex-shrink-0 w-full md:w-auto bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            {isConnectingStripe ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CreditCard className="w-5 h-5" /> 
                חבר חשבון בנק
                <ExternalLink className="w-4 h-4 mr-1 opacity-70" />
              </>
            )}
          </button>
        </div>
      )}

      {/* התראה על סשן חי (SOS נכנס) */}
      {activeSessions.length > 0 && (
        <div className="mb-8 bg-red-50 border-2 border-red-500 rounded-2xl p-6 shadow-lg max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500 text-white p-2 rounded-full animate-pulse"><PhoneCall className="w-6 h-6" /></div>
            <h2 className="text-xl font-bold text-red-700">קריאת SOS ממתינה לך!</h2>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-md">
            <Video className="w-5 h-5" /> היכנס לחדר עכשיו
          </button>
        </div>
      )}

      {/* קוביות סטטיסטיקה - ארנק מטפל */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          {hasStripeAccount && <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">מחובר לבנק</div>}
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600 inline-block mb-4"><DollarSign className="w-6 h-6" /></div>
          <p className="text-gray-500 text-sm font-medium mb-1">הכנסות החודש (נטו)</p>
          <h3 className="text-3xl font-bold text-gray-900">₪0.00</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="bg-purple-50 p-3 rounded-xl text-purple-600 inline-block mb-4"><Clock className="w-6 h-6" /></div>
          <p className="text-gray-500 text-sm font-medium mb-1">שעות סשנים החודש</p>
          <h3 className="text-3xl font-bold text-gray-900">0</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="bg-teal-50 p-3 rounded-xl text-teal-600 inline-block mb-4"><Activity className="w-6 h-6" /></div>
          <p className="text-gray-500 text-sm font-medium mb-1">ציון אמינות</p>
          <h3 className="text-3xl font-bold text-gray-900">{providerData.rating || '5.0'}</h3>
        </div>
      </div>
    </div>
  );
}
