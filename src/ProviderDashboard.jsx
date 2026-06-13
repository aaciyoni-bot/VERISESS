import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { 
  ShieldCheck, DollarSign, Video, Clock, Activity, 
  Bell, PhoneCall, CheckCircle2, Wallet, ArrowDownCircle, CheckCircle
} from 'lucide-react';

// ==========================================
// 1. חיבור למסד הנתונים (Firebase)
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

// ==========================================
// 2. קומפוננטת לוח הבקרה למטפל
// ==========================================
export default function ProviderDashboard() {
  const [user, setUser] = useState(null);
  const [providerData, setProviderData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // סטייט חדש לארנק הדיגיטלי (Wallet)
  const [availableBalance, setAvailableBalance] = useState(3450.00); // נתון דמו לצורך תצוגה
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  // זיהוי המטפל המחובר
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setIsLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // משיכת נתונים בזמן אמת מה-DB
  useEffect(() => {
    if (!user || !db) return;

    // 1. האזנה לפרופיל הפומבי
    const providerRef = doc(db, 'artifacts', appId, 'public', 'data', 'providers', user.uid);
    const unsubscribeProvider = onSnapshot(providerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProviderData(data);
        setIsOnline(data.isOnline || false);
      }
      setIsLoading(false);
    });

    // 2. האזנה לשיחות/סשנים פעילים (לקוחות שמחכים לו כרגע)
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

  // פעולת הדלקה/כיבוי של מצב SOS
  const toggleOnlineStatus = async () => {
    if (!user || !db) return;
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

  // פעולת משיכת כספים (Instant Payout)
  const handleWithdrawal = () => {
    if (availableBalance <= 0) return;
    setIsWithdrawing(true);
    
    // סימולציה של קריאה לשרת ה-Backend שלנו שקורא ל-Stripe Payouts
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawalSuccess(true);
      setAvailableBalance(0); // איפוס היתרה לאחר משיכה
      
      // העלמת הודעת ההצלחה אחרי כמה שניות
      setTimeout(() => setWithdrawalSuccess(false), 5000);
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // מסך גיבוי אם היוזר לא מחובר
  if (!user || !providerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4" dir="rtl">
        <ShieldCheck className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">אזור מאובטח למטפלים בלבד</h2>
        <p className="text-gray-500">עליך להתחבר למערכת או להשלים את תהליך ההרשמה (Onboarding) כדי לצפות בלוח הבקרה.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12" dir="rtl">
      
      {/* סרגל ניווט עליון למטפל */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-900" />
            <span className="font-bold text-xl text-blue-900">Veri<span className="text-teal-500">Sess</span></span>
            <span className="ml-2 bg-blue-50 text-blue-800 text-xs font-bold px-2 py-1 rounded-md hidden sm:inline-block">Provider Area</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700 relative">
              <Bell className="w-6 h-6" />
              {activeSessions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {activeSessions.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
              <div className="text-left hidden sm:block">
                <div className="text-sm font-bold text-gray-800">{providerData.displayName}</div>
                <div className="text-xs text-gray-500">{providerData.category}</div>
              </div>
              <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {providerData.displayName ? providerData.displayName.charAt(0) : 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        
        {/* כותרת אזור העבודה ומתג ה-SOS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">שלום, {providerData.displayName}</h1>
            <p className="text-gray-500">לוח הבקרה שלך מעודכן להיום.</p>
          </div>
          
          <div className={`p-4 rounded-2xl flex items-center gap-4 transition-all border-2 shadow-sm ${isOnline ? 'bg-white border-green-500' : 'bg-gray-100 border-gray-200'}`}>
            <div className="flex flex-col">
              <span className={`font-bold ${isOnline ? 'text-green-700' : 'text-gray-500'}`}>
                {isOnline ? 'זמין לקריאות SOS' : 'לא זמין כעת'}
              </span>
              <span className="text-xs text-gray-500">
                {isOnline ? 'לקוחות רואים אותך במערכת' : 'הדלק כדי לקבל עבודה'}
              </span>
            </div>
            
            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={toggleOnlineStatus} />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>

        {/* התראות על סשנים חיים שממתינים (The Money Maker!) */}
        {activeSessions.length > 0 && (
          <div className="mb-8 bg-red-50 border-2 border-red-500 rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500 text-white p-2 rounded-full animate-pulse">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-red-700">קריאת SOS ממתינה לך!</h2>
            </div>
            <div className="space-y-3">
              {activeSessions.map(session => (
                <div key={session.id} className="bg-white rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center shadow-sm border border-red-100">
                  <div className="mb-4 sm:mb-0 text-center sm:text-right">
                    <div className="font-bold text-gray-800">לקוח ממתין בחדר הטיפול</div>
                    <div className="text-sm text-gray-500">הכנסה צפויה: ₪{(providerData.rate * 0.8).toFixed(2)} (לאחר עמלה)</div>
                  </div>
                  <button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
                    <Video className="w-5 h-5" /> היכנס לחדר עכשיו
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* פאנל ארנק דיגיטלי וסטטיסטיקות */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* ארנק (Wallet) - הפיצ'ר החדש */}
          <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-900 flex flex-col justify-between relative overflow-hidden">
            {/* עיטור רקע */}
            <div className="absolute -left-6 -top-6 opacity-5 pointer-events-none">
              <Wallet className="w-32 h-32 text-blue-900" />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="bg-blue-900 p-3 rounded-xl text-white shadow-sm">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-md border border-green-200">
                זמין למשיכה מיידית
              </span>
            </div>
            
            <div className="relative z-10 mb-4">
              <p className="text-blue-900 text-sm font-bold mb-1">היתרה שלך (נטו)</p>
              <h3 className="text-4xl font-black text-gray-900">₪{availableBalance.toLocaleString('he-IL', {minimumFractionDigits: 2})}</h3>
            </div>

            {/* כפתור משיכה חכם */}
            {withdrawalSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 animate-in zoom-in">
                <CheckCircle className="w-5 h-5" /> הכסף בדרך לבנק!
              </div>
            ) : (
              <button 
                onClick={handleWithdrawal}
                disabled={isWithdrawing || availableBalance === 0}
                className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm
                  ${availableBalance === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : isWithdrawing 
                      ? 'bg-blue-100 text-blue-900 cursor-wait' 
                      : 'bg-blue-900 hover:bg-blue-800 text-white active:scale-95'}`}
              >
                {isWithdrawing ? (
                  <span className="flex items-center gap-2">מעבד העברה<span className="animate-pulse">...</span></span>
                ) : (
                  <>
                    <ArrowDownCircle className="w-5 h-5" /> {availableBalance === 0 ? 'אין יתרה למשיכה' : 'משוך לחשבון הבנק'}
                  </>
                )}
              </button>
            )}
          </div>

          {/* כרטיס שעות */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">שעות סשנים החודש</p>
              <h3 className="text-3xl font-bold text-gray-900">12.5 <span className="text-lg text-gray-400 font-normal">שעות</span></h3>
            </div>
          </div>

          {/* כרטיס אמינות */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
                <Activity className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3 h-3" /> מעולה
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">ציון אמינות מטפל</p>
              <h3 className="text-3xl font-bold text-gray-900">{providerData.rating || '5.0'} <span className="text-lg text-gray-400 font-normal">/ 5</span></h3>
            </div>
          </div>

        </div>

        {/* יומן פגישות עתידיות */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 text-lg">פגישות קרובות מתוזמנות</h3>
            <button className="text-teal-600 text-sm font-bold hover:underline">סנכרן יומן Google</button>
          </div>
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">אין פגישות מתוזמנות לימים הקרובים.</p>
            <p className="text-sm text-gray-400 mt-1">הדלק את כפתור ה-SOS כדי לקבל לקוחות מיידיים.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
