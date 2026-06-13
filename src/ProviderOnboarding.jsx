import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { 
  ShieldCheck, Upload, Camera, FileText, DollarSign, 
  CheckCircle, ChevronLeft, ChevronRight, Lock, UserCheck, Video
} from 'lucide-react';

// ==========================================
// 1. הגדרות וחיבורי Firebase 
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
// 2. קומפוננטת האונבורדינג הראשית
// ==========================================
export default function ProviderOnboarding() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // הסטייט של הטופס - תואם לסכמת ה-DB שלנו
  const [formData, setFormData] = useState({
    legalName: '',
    displayName: '',
    category: '',
    rate: 250,
    tags: '',
    licenseUploaded: false,
    livenessChecked: false,
    bio: ''
  });

  // התחברות ראשונית כדי שנוכל לכתוב ל-DB (בפרודקשן זה יהיה יוזר רשום)
  useEffect(() => {
    signInAnonymously(auth);
    const unsub = onAuthStateChanged(auth, (usr) => setUser(usr));
    return unsub;
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // סימולציית העלאת קובץ/צילום
  const handleSimulatedUpload = (field) => {
    setFormData(prev => ({ ...prev, [field]: true }));
  };

  // שמירה אמיתית ל-Firebase בסוף התהליך
  const handleSubmitToFirebase = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // 1. כתיבה לפרופיל הציבורי (מה שלקוחות יראו)
      const publicRef = doc(db, 'artifacts', appId, 'public', 'data', 'providers', user.uid);
      await setDoc(publicRef, {
        providerId: user.uid,
        displayName: formData.displayName || formData.legalName,
        category: formData.category,
        rate: Number(formData.rate),
        isOnline: false, // מתחילים כלא מחוברים
        rating: 5.0, // ציון התחלתי
        tags: formData.tags.split(',').map(t => t.trim()),
        createdAt: new Date().toISOString()
      });

      // 2. כתיבה לאזור האישי/חסוי של המטפל
      const privateRef = doc(db, 'artifacts', appId, 'users', user.uid, 'private_profile');
      await setDoc(privateRef, {
        legalName: formData.legalName,
        totalEarnings: 0,
        verified: false, // ממתין לאישור ה-Admin
        documentsSubmitted: true,
        onboardingCompleted: true
      });

      setStep(5); // מעבר למסך סיום
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("אירעה שגיאה בשמירת הנתונים.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  // --- עיצוב שלבים (Steps Indicators) ---
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8 px-4" dir="rtl">
      {[
        { num: 1, label: 'פרטים אישיים' },
        { num: 2, label: 'אימות זהות (KYC)' },
        { num: 3, label: 'תמחור ומומחיות' },
        { num: 4, label: 'סיום' }
      ].map((s, idx) => (
        <React.Fragment key={s.num}>
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s.num ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-gray-200 text-gray-500'}`}>
              {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
            </div>
            <span className={`text-xs mt-2 font-medium hidden md:block ${step >= s.num ? 'text-blue-900' : 'text-gray-400'}`}>{s.label}</span>
          </div>
          {idx < 3 && (
            <div className={`flex-1 h-1 mx-2 md:mx-4 rounded-full transition-colors ${step > s.num ? 'bg-teal-500' : 'bg-gray-200'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12" dir="rtl">
      {/* Header מאובטח */}
      <nav className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-teal-400" />
          <span className="text-xl font-bold">Veri<span className="text-teal-400">Sess</span> Partners</span>
        </div>
        <div className="flex items-center gap-2 text-xs bg-blue-800 px-3 py-1.5 rounded-full">
          <Lock className="w-3 h-3 text-teal-400" /> חיבור מוצפן (SSL)
        </div>
      </nav>

      <div className="max-w-2xl mx-auto mt-10 p-4">
        
        {step < 5 && <StepIndicator />}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          {/* שלב 1: פרטים בסיסיים */}
          {step === 1 && (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">ברוכים הבאים ל-VeriSess</h2>
              <p className="text-gray-500 mb-8">הקליניקה הווירטואלית המוגנת שלכם. בואו נקים את הפרופיל.</p>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">שם מלא (לפי תעודת זהות)</label>
                  <input type="text" name="legalName" value={formData.legalName} onChange={handleInputChange} placeholder="למשל: דוד כהן" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                  <p className="text-xs text-gray-400 mt-1">השם החוקי ישמש לחשבוניות וסליקה מול רשויות המס.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">שם תצוגה / כינוי מקצועי (אופציונלי)</label>
                  <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} placeholder="למשל: עו''ד דוד כהן" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                  <p className="text-xs text-gray-400 mt-1">זה השם שהלקוחות יראו בחיפוש ובשיחות הוידאו.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">תחום התמחות ראשי</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none">
                    <option value="">בחר תחום...</option>
                    <option value="law">עריכת דין ומשפט</option>
                    <option value="psychology">פסיכולוגיה ובריאות הנפש</option>
                    <option value="addiction">גמילה והתמכרויות</option>
                    <option value="sleep">הורות וייעוץ שינה</option>
                    <option value="business">ייעוץ עסקי ומשברים</option>
                    <option value="gaming">מנחי משחקים (D&D, שחמט)</option>
                    <option value="mysticism">רוחניות ותקשור</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* שלב 2: אימות וביטחון (KYC) */}
          {step === 2 && (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-8 h-8 text-blue-900" />
                <h2 className="text-2xl font-bold text-gray-800">אימות זהות מחמיר (KYC)</h2>
              </div>
              <p className="text-gray-500 mb-8">כדי לשמור על סביבה בטוחה, אנו מאמתים כל מומחה. המסמכים מוצפנים ונמחקים לאחר האימות.</p>
              
              <div className="space-y-6">
                {/* העלאת תעודה מקצועית */}
                <div className={`p-6 border-2 border-dashed rounded-2xl transition-all ${formData.licenseUploaded ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500" /> תעודת הסמכה / רישיון
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">העלה רישיון עריכת דין, תעודת פסיכולוג או הסמכה אחרת.</p>
                    </div>
                    {formData.licenseUploaded ? (
                      <div className="flex items-center gap-2 text-green-600 font-bold bg-green-100 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-5 h-5" /> הועלה
                      </div>
                    ) : (
                      <button onClick={() => handleSimulatedUpload('licenseUploaded')} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 flex items-center gap-2 shadow-sm">
                        <Upload className="w-4 h-4" /> בחר קובץ
                      </button>
                    )}
                  </div>
                </div>

                {/* בדיקת חיות - Liveness Check */}
                <div className={`p-6 border-2 border-dashed rounded-2xl transition-all ${formData.livenessChecked ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-gray-500" /> צילום סלפי חי (Liveness)
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">אמת שאתה אדם אמיתי כעת דרך מצלמת המכשיר.</p>
                    </div>
                    {formData.livenessChecked ? (
                      <div className="flex items-center gap-2 text-green-600 font-bold bg-green-100 px-3 py-2 rounded-lg">
                        <CheckCircle className="w-5 h-5" /> עבר אימות
                      </div>
                    ) : (
                      <button onClick={() => handleSimulatedUpload('livenessChecked')} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 flex items-center gap-2 shadow-sm">
                        <Camera className="w-4 h-4" /> פתח מצלמה
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* שלב 3: תמחור ופרופיל */}
          {step === 3 && (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">הגדרת הקליניקה שלך</h2>
              <p className="text-gray-500 mb-8">איך לקוחות ימצאו אותך ומה התעריף שלך.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">תעריף לסשן (SOS או מתוזמן - עד 45 דקות)</label>
                  <div className="relative">
                    <input type="number" name="rate" value={formData.rate} onChange={handleInputChange} className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-xl font-bold text-gray-800" />
                    <DollarSign className="absolute left-3 top-3.5 text-gray-400 w-6 h-6" />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>* כולל עמלת פלטפורמה וסליקה (20%)</span>
                    <span className="font-bold text-green-600">אתה תקבל: ₪{(formData.rate * 0.8).toFixed(0)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">תגיות חיפוש (מופרדות בפסיקים)</label>
                  <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="למשל: גירושין, משמורת, דחוף" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">סרטון היכרות קצר (עד 30 שניות) - מומלץ!</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                    <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-600">הקלט או העלה סרטון</p>
                    <p className="text-xs text-gray-400 mt-1">מטפלים עם וידאו מקבלים 300% יותר פניות SOS.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* שלב 4: סיכום */}
          {step === 4 && (
            <div className="p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ShieldCheck className="w-20 h-20 text-blue-900 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">מוכן לשליחה!</h2>
              <p className="text-gray-500 mb-6">הפרופיל שלך ({formData.displayName || formData.legalName}) יישמר באופן מאובטח ויועבר לצוות Trust & Safety שלנו לאישור סופי.</p>
              
              <div className="bg-gray-50 p-4 rounded-xl text-right text-sm text-gray-600 mb-8 border border-gray-200">
                <p className="mb-2"><strong>תחום:</strong> {formData.category}</p>
                <p className="mb-2"><strong>תעריף:</strong> ₪{formData.rate}</p>
                <p className="mb-2"><strong>מסמכים:</strong> {formData.licenseUploaded && formData.livenessChecked ? 'הועלו ואומתו ראשונית' : 'חסרים'}</p>
              </div>

              <button 
                onClick={handleSubmitToFirebase} 
                disabled={isSubmitting || !formData.licenseUploaded || !formData.livenessChecked}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex items-center justify-center gap-2 ${(!formData.licenseUploaded || !formData.livenessChecked) ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600 active:scale-95'}`}
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>שדר לצוות VeriSess וסיים <CheckCircle className="w-5 h-5" /></>
                )}
              </button>
              {(!formData.licenseUploaded || !formData.livenessChecked) && (
                <p className="text-red-500 text-xs mt-2 font-bold">אנא השלם העלאת מסמכים בשלב 2.</p>
              )}
            </div>
          )}

          {/* שלב 5: סיום מוצלח */}
          {step === 5 && (
            <div className="p-10 text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">ברוך הבא לנבחרת!</h2>
              <p className="text-gray-600 text-lg mb-8">
                הנתונים נשמרו בהצלחה במסד הנתונים בענן.<br/>
                ברגע שצוות האדמין יאשר את התעודות, תוכל להדליק את מתג ה-SOS ולהתחיל להרוויח.
              </p>
              <button className="bg-blue-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors">
                מעבר ללוח הבקרה (Dashboard)
              </button>
            </div>
          )}

          {/* כפתורי ניווט תחתונים (לא מופיעים בשלבי הסיום) */}
          {step < 4 && (
            <div className="bg-gray-50 border-t border-gray-100 p-4 flex justify-between items-center">
              <button 
                onClick={prevStep} 
                disabled={step === 1}
                className={`flex items-center gap-1 font-bold text-sm px-4 py-2 rounded-lg transition-colors ${step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                <ChevronRight className="w-4 h-4" /> חזור
              </button>
              <button 
                onClick={nextStep}
                className="flex items-center gap-1 font-bold text-sm bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors shadow-md"
              >
                המשך לשלב הבא <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
