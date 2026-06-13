import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { 
  Search, Filter, Star, Clock, ShieldCheck, 
  ChevronRight, PhoneCall, Video, User
} from 'lucide-react';

// ==========================================
// 1. חיבור למסד הנתונים (Firebase)
// ==========================================
let app, db, appId;

try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  appId = typeof __app_id !== 'undefined' ? __app_id : 'verisess-dev-id';
} catch (error) {
  console.error("Firebase Init Error:", error);
}

// ==========================================
// 2. קומפוננטת קטלוג המומחים (Marketplace)
// ==========================================
// שים לב: הוספתי את onSelectExpert לפרופס
export default function Marketplace({ onSelectExpert }) {
  const [experts, setExperts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // מצבי סינון וחיפוש
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sosOnly, setSosOnly] = useState(false);

  const categories = [
    { id: 'all', name: 'הכל' },
    { id: 'law', name: 'משפט ועריכת דין' },
    { id: 'psychology', name: 'פסיכולוגיה' },
    { id: 'sleep', name: 'ייעוץ שינה והורות' },
    { id: 'addiction', name: 'גמילה' },
    { id: 'gaming', name: 'חדרי משחק (פוקר/D&D)' }, // הוספתי גם גיימינג כדי שיהיה קל לבדוק
    { id: 'mysticism', name: 'רוחניות ותקשור' }
  ];

  // משיכת הנתונים בזמן אמת מ-Firebase
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

  // לוגיקת הסינון
  const filteredExperts = experts.filter(expert => {
    const matchesSearch = (expert.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (expert.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || expert.category === selectedCategory;
    const matchesSos = sosOnly ? expert.isOnline === true : true;
    
    return matchesSearch && matchesCategory && matchesSos;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12" dir="rtl">
      
      {/* אזור החיפוש העליון (Hero Section) */}
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
        
        {/* סרגל סינון (Filters) */}
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

        {/* רשימת המומחים */}
        <div className="flex-1">
          <div className="mb-4 flex justify-between items-end">
            <h2 className="text-xl font-bold text-gray-800">
              תוצאות חיפוש <span className="text-gray-400 font-normal text-sm">({filteredExperts.length} נמצאו)</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredExperts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">לא נמצאו תוצאות</h3>
              <p className="text-gray-500">נסה לשנות את מילות החיפוש או לבטל את סינון ה-SOS.</p>
              <button onClick={() => {setSearchQuery(''); setSosOnly(false); setSelectedCategory('all');}} className="mt-4 text-teal-600 font-medium hover:underline">
                נקה סינונים
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExperts.map(expert => (
                <div key={expert.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                  
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(expert.tags || []).slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md border border-gray-100">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="font-bold text-xl text-teal-600">
                      ₪{expert.rate}
                    </div>
                    {/* הפעלת onSelectExpert בלחיצה */}
                    <button 
                      onClick={() => onSelectExpert && onSelectExpert(expert.id, expert.category === 'gaming' ? 'gaming' : 'therapy')}
                      className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 ${expert.isOnline ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'}`}
                    >
                      {expert.isOnline ? (
                        <><PhoneCall className="w-4 h-4" /> שיחת SOS</>
                      ) : (
                        <><Video className="w-4 h-4" /> תאם פגישה</>
                      )}
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
