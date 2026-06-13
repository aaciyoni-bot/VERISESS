import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { ShieldCheck, DollarSign, Video, Clock, Activity, PhoneCall, CheckCircle2 } from 'lucide-react';

// חיבור לפיירבייס - במערכת אמיתית זה ישב בקובץ נפרד
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

  // מאזין למשתמש המחובר
  useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setIsLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // מושך נתונים מהמסד (פרופיל וסשנים פעילים)
  useEffect(() => {
    if (!user || !db) return;
    
    // משיכת נתוני הפרופיל (כדי לדעת אם הוא מחובר או לא)
    const providerRef = doc(db, 'artifacts', appId, 'public', 'data', 'providers', user.uid);
    const unsubscribeProvider = onSnapshot(providerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProviderData(data);
        setIsOnline(data.isOnline || false);
      }
      setIsLoading(false);
    });

    // משיכת סשנים פעילים (SOS) שמחכים למטפל הזה
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

  // פעולת מתג ה-SOS
  const toggleOnlineStatus = async () => {
    if (!user || !db) return;
    const newStatus = !isOnline;
    setIsOnline(newStatus); // עדכון מיידי ויזואלי
    try {
      const providerRef = doc(db, 'artifacts', appId, 'public', 'data', 'providers', user.uid);
      await setDoc(providerRef, { isOnline: newStatus }, { merge: true });
    } catch (error) {
      console.error("Error updating status:", error);
      setIsOnline(!newStatus); // במקרה של שגיאה, נחזיר את המתג
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

  return (
    <div className="bg-gray-50 h-full w-full px-4 pt-8" dir="rtl">
      
      {/* אזור העליון עם מתג ה-SOS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">שלום, {providerData.displayName}</h1>
          <p className="text-gray-500">לוח הבקרה שלך מעודכן להיום.</p>
        </div>
        
        <div className={`p-4 rounded-2xl flex items-center gap-4 transition-all border-2 shadow-sm ${isOnline ? 'bg-white border-green-500' : 'bg-gray-100 border-gray-200'}`}>
          <div className="flex flex-col">
            <span className={`font-bold ${isOnline ? 'text-green-700' : 'text-gray-500'}`}>
              {isOnline ? 'זמין לקריאות SOS' : 'לא זמין כעת'}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={toggleOnlineStatus} />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>

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

      {/* קוביות סטטיסטיקה */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600 inline-block mb-4"><DollarSign className="w-6 h-6" /></div>
          <p className="text-gray-500 text-sm font-medium mb-1">הכנסות החודש</p>
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
