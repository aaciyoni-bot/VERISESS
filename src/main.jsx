import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { 
  ShieldCheck, LogOut, Search, Filter, Star, Clock, 
  ChevronRight, PhoneCall, Video, User, Upload, Camera, 
  FileText, DollarSign, CheckCircle, ChevronLeft, Lock, 
  UserCheck, Activity, Settings, Bell, CheckCircle2 
} from 'lucide-react';

// ==========================================
// 1. הגדרות וחיבורי Firebase גלובליים
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
// 2. קומפוננטת קטלוג המומחים (Marketplace)
// ==========================================
function Marketplace() {
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sosOnly, setSosOnly] = useState(false);

  const categories = [
    { id: 'all', name: 'הכל' },
    { id: 'law', name: 'משפט ועריכת דין' },
    { id: 'psychology', name: 'פסיכולוגיה' },
    { id: 'sleep', name: 'ייעוץ שינה והורות' },
    { id: 'addiction', name: 'גמילה' },
    { id: 'mysticism', name: 'רוחניות ותקשור' }
  ];

  useEffect(() => {
    if (!db) return;
    const providersRef = collection(db, 'artifacts', appId, 'public', 'data', 'providers');
    const unsubscribe = onSnapshot(providersRef, (snapshot) => {
      const providersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExperts(providersData);
      setIsLoading(false);
    }, (error) => {
      console.error("שגיאה במשיכת נתונים:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = (expert.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (expert.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || expert.category === selectedCategory;
    const matchesSos = sosOnly ? expert.isOnline === true : true;
    return matchesSearch && matchesCategory && matchesSos;
  });

  return (
    <div className="pb-12" dir="rtl">
      <div className="bg-blue-900 text-white pt-12 pb-8 px-4 rounded-b-3xl shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <ShieldCheck className="w-64 h-64 -mt-10 -mr-10" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">מצא את המומחה שאתה צריך. <span className="text-teal-400">עכשיו.</span></h1>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">מערכת VeriSess מבטיחה לך שיחות וידאו מאובטחות, מוצפנות ופרטיות לחלוטין עם המומחים המובילים בישראל.</p>
          <div className="bg-white rounded-full p-2 flex items-center shadow-xl max-w-2xl mx-auto">
            <div className="bg-blue-50 p-3 rounded-full text-blue-900 mr-1">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="חפש תחום, שם מטפל או מילת מפתח..." 
              className="flex-1 bg-transparent border-none focus:outline-none text-gray-800 px-4 placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full font-bold transition-colors ml-1 hidden md:block">
              חפש
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-teal-500" /> סינון תוצאות
            </h3>
            <div className="mb-6 bg-red-50 p-4 rounded-xl border border-red-100">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="block font-bold text-red-700 text-sm">זמינים עכשיו (SOS)</span>
                  <span className="text-xs text-red-500">התחל שיחה תוך דקה</span>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={sosOnly} onChange={() => setSosOnly(!sosOnly)} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${sosOnly ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${sosOnly ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>
            <h4 className="font-bold text-gray-700 text-sm mb-3">קטגוריות</h4>
            <div className="space-y-2">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? 'bg-blue-50 text-blue-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4 flex justify-between items-end">
            <h2 className="text-xl font-bold text-gray-800">
              תוצאות חיפוש <span className="text-gray-400 font-normal text-sm">({filteredExperts.length} מומחים נמצאו)</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredExperts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">לא נמצאו מומחים</h3>
              <p className="text-gray-500">נסה לשנות את מילות החיפוש או לבטל את סינון ה-SOS.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExperts.map(expert => (
                <div key={expert.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                  {expert.isOnline && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      זמין עכשיו
                    </div>
                  )}
                  <div className="flex gap-4">
                    <img src={expert.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.displayName)}&background=0D8ABC&color=fff`} alt={expert.displayName} className="w-20 h-20 rounded-xl object-cover border border-gray-100" />
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1">
                        {expert.displayName}
                        <ShieldCheck className="w-4 h-4 text-teal-500" title="פרופיל מאומת" />
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">{expert.category}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1 font-medium text-amber-500">
                          <Star className="w-4 h-4 fill-current" /> {expert.rating || '5.0'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" /> 45 דק'
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="font-bold text-xl text-teal-600">₪{expert.rate}</div>
                    <button className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 ${expert.isOnline ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'}`}>
                      {expert.isOnline ? <><PhoneCall className="w-4 h-4" /> שיחת SOS</> : <><Video className="w-4 h-4" /> תאם פגישה</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. קומפוננטת תהליך קליטת מומחים (Provider Onboarding)
// ==========================================
function ProviderOnboarding() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    legalName: '', displayName: '', category: '', rate: 250, tags: '',
    licenseUploaded: false, livenessChecked: false, bio: ''
  });

  useEffect(() => {
    if (auth) {
      signInAnonymously(auth);
      const unsub = onAuthStateChanged(auth, (usr) => setUser(usr));
      return unsub;
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitToFirebase = async () => {
    if (!user || !db) return;
    setIsSubmitting(true);
    try {
      const publicRef = doc(db, 'artifacts', appId, 'public', 'data', 'providers', user.uid);
      await setDoc(publicRef, {
        providerId: user.uid,
        displayName: formData.displayName || formData.legalName,
        category: formData.category,
        rate: Number(formData.rate),
        isOnline: false,
        rating: 5.0,
        tags: formData.tags.split(',').map(t => t.trim()),
        createdAt: new Date().toISOString()
      });
      const privateRef = doc(db, 'artifacts', appId, 'users', user.uid, 'private_profile');
      await setDoc(privateRef, {
        legalName: formData.legalName,
        totalEarnings: 0,
        verified: false,
        documentsSubmitted: true,
        onboardingCompleted: true
      });
      setStep(5);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-12" dir="rtl">
      <div className="max-w-2xl mx-auto mt-10 p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-8">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">ברוכים הבאים ל-VeriSess</h2>
              <p className="text-gray-500 mb-8">בואו נקים את הפרופיל המקצועי שלכם.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">שם מלא</label>
                  <input type="text" name="legalName" value={formData.legalName} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">שם תצוגה</label>
                  <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">תחום התמחות</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <option value="">בחר תחום...</option>
                    <option value="law">משפט</option>
                    <option value="psychology">פסיכולוגיה</option>
                    <option value="sleep">ייעוץ שינה</option>
                  </select>
                </div>
                <button onClick={() => setStep(2)} className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl mt-4">המשך לשלב הבא</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">אימות וביטחון (KYC)</h2>
              <div className="space-y-6 mt-6">
                <button onClick={() => setFormData(p => ({...p, licenseUploaded: true}))} className={`w-full p-4 border-2 rounded-xl flex items-center justify-between ${formData.licenseUploaded ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <span className="font-bold">העלאת תעודת רישיון</span>
                  {formData.licenseUploaded ? <CheckCircle className="text-green-500 w-6 h-6"/> : <Upload className="text-gray-400 w-6 h-6"/>}
                </button>
                <button onClick={() => setFormData(p => ({...p, livenessChecked: true}))} className={`w-full p-4 border-2 rounded-xl flex items-center justify-between ${formData.livenessChecked ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <span className="font-bold">צילום סלפי לאימות</span>
                  {formData.livenessChecked ? <CheckCircle className="text-green-500 w-6 h-6"/> : <Camera className="text-gray-400 w-6 h-6"/>}
                </button>
                <button onClick={() => setStep(3)} className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl mt-4">המשך לשלב הבא</button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">תמחור וסיכום</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">תעריף לשיחה (₪)</label>
                  <input type="number" name="rate" value={formData.rate} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-xl" />
                </div>
                <button onClick={handleSubmitToFirebase} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl mt-6 shadow-md transition-all flex justify-center items-center gap-2">
                  {isSubmitting ? 'מעדכן...' : 'סיים והגש לאישור'}
                </button>
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="text-center animate-in zoom-in">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">נרשמת בהצלחה!</h2>
              <p className="text-gray-500">הפרופיל שלך נוצר וממתין לאישור הנהלה.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. קומפוננטת לוח הבקרה למטפל (Dashboard)
// ==========================================
function ProviderDashboard() {
  const [user, setUser] = useState(null);
  const [providerData, setProviderData] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setIsLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

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

  if (isLoading) {
    return <div className="py-20 text-center"><div className="w-12 h-12 border-4 border-blue-900 border-t-teal-500 rounded-full animate-spin mx-auto"></div></div>;
  }

  if (!user || !providerData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center p-4" dir="rtl">
        <ShieldCheck className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">אזור מאובטח למטפלים בלבד</h2>
        <p className="text-gray-500">עליך להתחבר או להירשם כמומחה.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-8" dir="rtl">
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
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={toggleOnlineStatus} />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>

      {activeSessions.length > 0 && (
        <div className="mb-8 bg-red-50 border-2 border-red-500 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500 text-white p-2 rounded-full animate-pulse"><PhoneCall className="w-6 h-6" /></div>
            <h2 className="text-xl font-bold text-red-700">קריאת SOS ממתינה לך!</h2>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-md">
            <Video className="w-5 h-5" /> היכנס לחדר עכשיו
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

// ==========================================
// 5. נתב האפליקציה המרכזי (App Shell)
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('welcome');
  const [isLoading, setIsLoading] = useState(true);

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
      {currentView !== 'welcome' && <GlobalNavbar />}

      {currentView === 'welcome' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-900 to-gray-900" dir="rtl">
          <div className="text-center mb-12 animate-in fade-in zoom-in duration-700">
            <ShieldCheck className="w-24 h-24 text-teal-400 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-white mb-4">Veri<span className="text-teal-400">Sess</span></h1>
            <p className="text-xl text-blue-200">הקליניקה הווירטואלית המאובטחת בעולם.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center hover:scale-105 transition-transform cursor-pointer" onClick={handleGuestLogin}>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">אני מחפש ייעוץ</h2>
              <p className="text-gray-500 mb-6">מצא עורך דין, פסיכולוג או יועץ זמין עכשיו לשיחת וידאו מאובטחת ודיסקרטית.</p>
              <button className="mt-auto w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md text-lg">
                היכנס כלקוח (SOS)
              </button>
            </div>

            <div className="bg-blue-800 rounded-2xl p-8 shadow-xl border border-blue-700 flex flex-col items-center text-center hover:scale-105 transition-transform">
              <h2 className="text-2xl font-bold text-white mb-2">אני מומחה / מטפל</h2>
              <p className="text-blue-200 mb-6">הצטרף למרחב המוגן, נהל קליניקה חכמה וקבל לקוחות חדשים בזמנך הפנוי.</p>
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

      {currentView === 'marketplace' && <Marketplace />}
      {currentView === 'onboarding' && <ProviderOnboarding />}
      {currentView === 'dashboard' && <ProviderDashboard />}

    </div>
  );
}
