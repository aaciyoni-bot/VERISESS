import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { 
  ShieldCheck, LogOut, LayoutDashboard, Video, VideoOff, Mic, MicOff, 
  Clock, PhoneCall, MessageSquare, PenTool, Users, ShieldAlert, 
  UserPlus, Check, X, MonitorUp, Hand, AlertTriangle, Activity, 
  Lock, Search, Eye, CheckCircle, Bell, FileText, XCircle, 
  DollarSign, Wallet, ArrowDownCircle, CheckCircle2, CreditCard, 
  ChevronRight, Smartphone
} from 'lucide-react';

// ==========================================
// 1. אתחול פיירבייס גלובלי (עבור כל המסכים)
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
// 2. מסכי המערכת (הוכנסו לקובץ אחד כדי למנוע שגיאות ייבוא)
// ==========================================

const Marketplace = ({ onSelectExpert }) => (
  <div className="p-8 max-w-6xl mx-auto min-h-screen" dir="rtl">
    <h2 className="text-3xl font-bold text-blue-900 mb-6 flex items-center gap-2">
      <ShieldCheck className="w-8 h-8 text-teal-500" />
      קטלוג מומחים זמינים (SOS)
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-3xl mb-4 shadow-sm">
            {i === 1 ? 'ד' : i === 2 ? 'ע' : 'י'}
          </div>
          <h3 className="text-xl font-bold text-gray-800">{i === 1 ? 'ד"ר יעל שרת' : i === 2 ? 'עו"ד דניאל כהן' : 'יצחק לוי (יועץ זוגי)'}</h3>
          <p className="text-gray-500 text-sm mb-2">{i === 1 ? 'פסיכולוגיה קלינית' : i === 2 ? 'דיני משפחה' : 'גישור ומשברים'}</p>
          <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-50 px-3 py-1 rounded-full mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> זמין עכשיו לשיחה
          </div>
          <button onClick={() => onSelectExpert(`expert_${i}`)} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md">
            התייעץ עכשיו (₪{150 + (i * 50)})
          </button>
        </div>
      ))}
    </div>
  </div>
);

const ProviderOnboarding = () => (
  <div className="p-8 max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-xl border border-gray-100 text-center" dir="rtl">
    <ShieldCheck className="w-16 h-16 text-blue-900 mx-auto mb-4" />
    <h2 className="text-2xl font-bold mb-2">הרשמת מטפלים (KYC)</h2>
    <p className="text-gray-500 text-sm mb-6">אנא הזן את פרטי הרישיון שלך לאימות מערכת</p>
    <input type="text" placeholder="שם מלא" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-blue-500" />
    <input type="text" placeholder="מספר רישיון / תעודה" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-blue-500" />
    <button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors">שלח לבדיקת Trust & Safety</button>
  </div>
);

const VideoRoom = ({ sessionId, onLeave }) => (
  <div className="p-4 h-[85vh]" dir="rtl">
    <div className="bg-gray-900 w-full h-full rounded-2xl flex flex-col items-center justify-center relative overflow-hidden text-white shadow-2xl border border-gray-800">
       <div className="absolute top-4 right-4 flex gap-2">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-2"><Video className="w-4 h-4"/> LIVE E2EE</span>
       </div>
       <Video className="w-20 h-20 text-gray-700 mb-6" />
       <h2 className="text-2xl font-bold mb-2">חדר טיפול חסוי 1-על-1</h2>
       <p className="text-gray-500 mb-8 font-mono bg-black/50 px-4 py-2 rounded-lg">Session ID: {sessionId}</p>
       <button onClick={onLeave} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg">
         <PhoneCall className="w-5 h-5 transform rotate-[135deg]" /> נתק שיחה וסיים סשן
       </button>
    </div>
  </div>
);

const ProviderDashboard = () => {
  const [availableBalance, setAvailableBalance] = useState(3450.00); 
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const handleWithdrawal = () => {
    if (availableBalance <= 0) return;
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawalSuccess(true);
      setAvailableBalance(0);
      setTimeout(() => setWithdrawalSuccess(false), 5000);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 min-h-screen" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">שלום, ד"ר יעל שרת</h1>
          <p className="text-gray-500">לוח הבקרה שלך מעודכן להיום.</p>
        </div>
        <div className={`p-4 rounded-2xl flex items-center gap-4 transition-all border-2 shadow-sm ${isOnline ? 'bg-white border-green-500' : 'bg-gray-100 border-gray-200'}`}>
          <div className="flex flex-col">
            <span className={`font-bold ${isOnline ? 'text-green-700' : 'text-gray-500'}`}>
              {isOnline ? 'זמין לקריאות SOS' : 'לא זמין כעת'}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-900 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -left-6 -top-6 opacity-5 pointer-events-none"><Wallet className="w-32 h-32 text-blue-900" /></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="bg-blue-900 p-3 rounded-xl text-white shadow-sm"><DollarSign className="w-6 h-6" /></div>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-md border border-green-200">זמין למשיכה</span>
          </div>
          <div className="relative z-10 mb-4">
            <p className="text-blue-900 text-sm font-bold mb-1">היתרה שלך (נטו)</p>
            <h3 className="text-4xl font-black text-gray-900">₪{availableBalance.toLocaleString()}</h3>
          </div>
          {withdrawalSuccess ? (
            <div className="bg-green-50 border border-green-200 text-green-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> הכסף הועבר לבנק!
            </div>
          ) : (
            <button onClick={handleWithdrawal} disabled={isWithdrawing || availableBalance === 0} className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${availableBalance === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isWithdrawing ? 'bg-blue-100 text-blue-900' : 'bg-blue-900 hover:bg-blue-800 text-white'}`}>
              {isWithdrawing ? 'מעבד העברה...' : <><ArrowDownCircle className="w-5 h-5" /> משוך לחשבון הבנק</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ClientCheckout = ({ expertId, onCancel, onSuccess }) => {
  const [expert, setExpert] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // סימולציית נתונים כדי שהקופה תמיד תעבוד ותיראה טוב
    setExpert({ id: expertId, displayName: 'ד"ר יעל שרת', category: 'פסיכולוגיה קלינית', rate: 250 });
    setIsLoading(false);
  }, [expertId]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      onSuccess(`sess_${Date.now()}`);
    }, 1500);
  };

  if (isLoading || !expert) return <div className="p-12 text-center text-gray-500">טוען קופה...</div>;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative" dir="rtl">
      <button onClick={onCancel} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 bg-white/80 px-2 py-1 rounded-md text-sm z-10">חזור</button>
      <div className="bg-gradient-to-b from-blue-50 to-white pt-10 pb-6 px-6 text-center border-b border-gray-100">
        <Lock className="w-8 h-8 text-teal-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-blue-900 mb-1">קופה מאובטחת</h2>
        <p className="text-sm text-gray-500 font-medium">מסגרת האשראי תשוריין בלבד.</p>
      </div>
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 font-bold text-xl">{expert.displayName.charAt(0)}</div>
          <div className="flex-1">
            <div className="font-bold text-gray-800">{expert.displayName}</div>
            <div className="text-xs text-gray-500">{expert.category}</div>
          </div>
          <div className="font-black text-2xl text-blue-900">₪{expert.rate}</div>
        </div>
        <button onClick={handlePaymentSubmit} disabled={isProcessing} className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex justify-center items-center gap-2 ${isProcessing ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'}`}>
          {isProcessing ? 'משריין סכום...' : <><Lock className="w-5 h-5" /> אשר והיכנס לשיחה</>}
        </button>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users'); 
  return (
    <div className="min-h-[85vh] bg-gray-100 flex font-sans" dir="rtl">
      <div className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-gray-800">
          <h2 className="font-bold text-lg flex items-center gap-2"><ShieldCheck className="text-red-500 w-6 h-6"/> Trust & Safety</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${activeTab === 'users' ? 'bg-gray-800 border-r-4 border-red-500' : 'text-gray-400 hover:bg-gray-800'}`}>
            <Users className="w-5 h-5" /> אישור מטפלים (KYC)
          </button>
          <button onClick={() => setActiveTab('alerts')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${activeTab === 'alerts' ? 'bg-gray-800 border-r-4 border-red-500' : 'text-gray-400 hover:bg-gray-800'}`}>
            <AlertTriangle className="w-5 h-5" /> יומן התראות AI
          </button>
        </nav>
      </div>
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{activeTab === 'users' ? 'ניהול מטפלים חדשים' : 'יומן התראות אבטחה'}</h2>
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-200">
           <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
           <p className="text-gray-500">פאנל ניהול פעיל. נתונים יטענו מהענן.</p>
        </div>
      </div>
    </div>
  );
};

const GroupRoom = ({ sessionId, onLeave, isHost = true }) => {
  const [activeTab, setActiveTab] = useState('participants');
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [participants] = useState([
    { id: 'me', name: 'אני (מנחה)', isHost: true, micOn: micEnabled, camOn: cameraEnabled, isLocal: true },
    { id: 'p1', name: 'דניאל כהן', isHost: false, micOn: false, camOn: true, isLocal: false, img: '' },
    { id: 'p2', name: 'יעל שרת', isHost: false, micOn: true, camOn: false, isLocal: false, img: '' },
  ]);

  return (
    <div className="max-w-7xl mx-auto my-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl h-[85vh] flex relative border border-gray-800" dir="rtl">
      <div className="flex-1 relative bg-black flex flex-col overflow-hidden">
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <div className="bg-gray-800/80 backdrop-blur text-white px-3 py-1.5 rounded-lg text-sm border border-gray-700">חדר קבוצתי</div>
        </div>
        <div className="flex-1 p-4 mt-12 grid gap-4 grid-cols-2 grid-rows-2">
          {participants.map((p) => (
            <div key={p.id} className="bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700">
               <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-4xl font-bold text-gray-700">{p.name.charAt(0)}</div>
               <div className="absolute bottom-3 right-3 bg-black/60 px-3 py-1.5 rounded-lg text-white text-sm">{p.name}</div>
            </div>
          ))}
        </div>
        <div className="bg-gray-900/95 p-4 flex justify-center gap-4 z-20 border-t border-gray-800">
          <button onClick={() => setMicEnabled(!micEnabled)} className={`p-4 rounded-xl ${micEnabled ? 'bg-gray-800 text-white' : 'bg-red-500/20 text-red-500'}`}>
            {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          <button onClick={() => setCameraEnabled(!cameraEnabled)} className={`p-4 rounded-xl ${cameraEnabled ? 'bg-gray-800 text-white' : 'bg-red-500/20 text-red-500'}`}>
            {cameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
          <div className="w-px h-10 bg-gray-700 mx-2 self-center"></div>
          <button onClick={onLeave} className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold flex items-center gap-2">
             <PhoneCall className="w-5 h-5 transform rotate-[135deg]" /> עזוב חדר קבוצתי
          </button>
        </div>
      </div>
      <div className="w-80 bg-gray-50 flex flex-col z-20 border-l border-gray-200">
        <div className="flex bg-white border-b border-gray-200 p-2 gap-1">
          <button className="flex-1 py-2 text-sm font-bold rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center gap-1.5"><Users className="w-4 h-4" /> משתתפים</button>
        </div>
        <div className="p-4 space-y-2 flex-1">
           {participants.map(p => (
             <div key={p.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center shadow-sm">
                <span className="font-bold text-sm text-gray-800">{p.name}</span>
                {p.isHost && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded">מנחה</span>}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. הנתב הראשי של האפליקציה (App)
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('welcome'); 
  const [isLoading, setIsLoading] = useState(true);

  const [testSessionId, setTestSessionId] = useState('sess_test_123');
  const [testExpertId, setTestExpertId] = useState('expert_test_123');

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGuestLogin = async () => {
    if (!auth) return;
    try {
      setIsLoading(true);
      await signInAnonymously(auth);
      setCurrentView('marketplace');
    } catch (error) {
      console.error("Guest login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    setCurrentView('welcome');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-900 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const DevNavigationBar = () => (
    <div className="bg-gray-900 text-gray-300 text-xs py-2 px-4 flex flex-wrap gap-4 items-center justify-center border-b-4 border-red-500" dir="rtl">
      <span className="font-bold text-white flex items-center gap-1">
        <LayoutDashboard className="w-4 h-4 text-red-500"/> תפריט פיתוח (Dev):
      </span>
      <button onClick={() => setCurrentView('welcome')} className="hover:text-white transition-colors">מסך פתיחה</button><span>|</span>
      <button onClick={() => setCurrentView('marketplace')} className="hover:text-white transition-colors">קטלוג</button><span>|</span>
      <button onClick={() => setCurrentView('checkout')} className="hover:text-white transition-colors">קופה</button><span>|</span>
      <button onClick={() => setCurrentView('videoRoom')} className="hover:text-white transition-colors">1-על-1</button><span>|</span>
      <button onClick={() => setCurrentView('groupRoom')} className="text-teal-400 font-bold hover:text-teal-300 transition-colors">חדר קבוצתי</button><span>|</span>
      <button onClick={() => setCurrentView('onboarding')} className="hover:text-white transition-colors">הרשמת מטפל</button><span>|</span>
      <button onClick={() => setCurrentView('dashboard')} className="hover:text-white transition-colors">לוח בקרה מטפל</button><span>|</span>
      <button onClick={() => setCurrentView('admin')} className="text-red-400 font-bold hover:text-red-300 transition-colors">מערכת ניהול</button>
    </div>
  );

  const GlobalNavbar = () => (
    <nav className="bg-blue-900 text-white shadow-md border-b border-blue-800 px-6 py-3 flex justify-between items-center sticky top-0 z-50" dir="rtl">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('welcome')}>
        <ShieldCheck className="w-8 h-8 text-teal-400" />
        <span className="text-xl font-bold">Veri<span className="text-teal-400">Sess</span></span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 hover:text-red-100 transition-colors text-sm font-bold bg-blue-800 px-3 py-1.5 rounded-lg">
            <LogOut className="w-4 h-4" /> התנתק
          </button>
        )}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <DevNavigationBar />
      {currentView !== 'welcome' && currentView !== 'videoRoom' && currentView !== 'groupRoom' && currentView !== 'admin' && <GlobalNavbar />}

      {currentView === 'welcome' && (
        <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-900 to-gray-900" dir="rtl">
          <div className="text-center mb-12 animate-in fade-in zoom-in duration-700">
            <ShieldCheck className="w-24 h-24 text-teal-400 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-white mb-4">Veri<span className="text-teal-400">Sess</span></h1>
            <p className="text-xl text-blue-200">הקליניקה הווירטואלית המאובטחת בעולם.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center hover:scale-105 transition-transform cursor-pointer" onClick={() => setCurrentView('marketplace')}>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">אני מחפש ייעוץ</h2>
              <p className="text-gray-500 mb-6">מצא עורך דין, פסיכולוג או יועץ זמין עכשיו לשיחת וידאו.</p>
              <button className="mt-auto w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md text-lg">
                היכנס כלקוח (SOS)
              </button>
            </div>

            <div className="bg-blue-800 rounded-2xl p-8 shadow-xl border border-blue-700 flex flex-col items-center text-center hover:scale-105 transition-transform">
              <h2 className="text-2xl font-bold text-white mb-2">אני מומחה / מטפל</h2>
              <p className="text-blue-200 mb-6">הצטרף למרחב המוגן, נהל קליניקה וקבל לקוחות חדשים.</p>
              <div className="mt-auto w-full flex flex-col gap-3">
                <button onClick={() => setCurrentView('onboarding')} className="w-full bg-white hover:bg-gray-100 text-blue-900 font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                  הגש בקשת הצטרפות
                </button>
                <button onClick={() => setCurrentView('dashboard')} className="w-full bg-blue-900 hover:bg-blue-950 text-white border border-blue-600 font-bold py-3 px-6 rounded-xl transition-colors">
                  כניסה למטפלים רשומים
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'marketplace' && <Marketplace onSelectExpert={(id) => { setTestExpertId(id); setCurrentView('checkout'); }} />}
      {currentView === 'onboarding' && <ProviderOnboarding />}
      {currentView === 'dashboard' && <ProviderDashboard />}
      {currentView === 'admin' && <AdminPanel />}
      
      {currentView === 'checkout' && (
        <div className="p-8">
          <ClientCheckout expertId={testExpertId} onCancel={() => setCurrentView('marketplace')} onSuccess={(sessionId) => { setTestSessionId(sessionId); setCurrentView('videoRoom'); }} />
        </div>
      )}
      
      {currentView === 'videoRoom' && <VideoRoom sessionId={testSessionId} onLeave={() => setCurrentView('marketplace')} />}
      {currentView === 'groupRoom' && <GroupRoom sessionId={testSessionId} onLeave={() => setCurrentView('welcome')} isHost={true} />}
    </div>
  );
}
