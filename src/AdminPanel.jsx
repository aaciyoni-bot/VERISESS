import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Users, Video, Activity, 
  Lock, Search, Eye, CheckCircle, Bell, FileText, XCircle, Check
} from 'lucide-react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // מצב המערכת
  const [activeTab, setActiveTab] = useState('users'); // 'dashboard', 'live_sessions', 'alerts', 'users'
  const [simulatedAlert, setSimulatedAlert] = useState(null);

  // נתוני דמו לאישור מטפלים (בפרודקשן נמשך מ-Firebase)
  const [pendingProviders, setPendingProviders] = useState([
    { id: 'PROV-1042', name: 'דניאל כהן', category: 'פסיכולוגיה קלינית', date: 'היום, 10:45', liveness: true, license: true, status: 'pending' },
    { id: 'PROV-1043', name: 'עו"ד שרה לוי', category: 'משפט פלילי', date: 'היום, 09:12', liveness: true, license: true, status: 'pending' },
    { id: 'PROV-1044', name: 'אורן יצחקי', category: 'ייעוץ זוגי', date: 'אתמול, 18:30', liveness: true, license: false, status: 'missing_docs' }
  ]);

  // התחברות
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      
      // סימולציה של התראת AI חיה שנכנסת
      setTimeout(() => {
        setSimulatedAlert({
          id: 'ROOM-892',
          expert: 'ד"ר יעל שרת',
          client: 'אנונימי_44',
          type: 'anti_circumvention',
          keyword: '"תעביר לי בביט"',
          confidence: '98%',
          time: new Date().toLocaleTimeString()
        });
      }, 4000);
    } else {
      setLoginError('סיסמה שגויה. הניסיון תועד במערכת.');
    }
  };

  // פונקציה לאישור מטפל
  const approveProvider = (id) => {
    setPendingProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    // בפרודקשן: כאן נשלח בקשה ל-Firebase לעדכן את השדה verified: true
    alert(`המטפל ${id} אושר בהצלחה. כעת הוא יכול לקבל שיחות.`);
  };

  // --- מסך התחברות מאובטח (Login) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
          <div className="text-center mb-8">
            <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">VeriSess Admin</h1>
            <p className="text-gray-400 text-sm mt-2">כניסה למרחב מוגן. נדרש סיווג ביטחוני.</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">קוד מזהה (Badge ID)</label>
              <input type="text" value="TS-LEAD-01" disabled className="w-full bg-gray-700 text-gray-500 border border-gray-600 rounded-lg px-4 py-3 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">סיסמת גישה</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הזן admin123"
                  className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" 
                />
                <Lock className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
              </div>
              {loginError && <p className="text-red-400 text-sm mt-2 font-medium">{loginError}</p>}
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-red-600/30">
              אמת והיכנס
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- המערכת הפנימית (Admin Dashboard) ---
  return (
    <div className="min-h-screen bg-gray-100 flex font-sans" dir="rtl">
      
      {/* תפריט צד (Sidebar) */}
      <div className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-red-500" />
          <div>
            <h2 className="font-bold text-lg">Trust & Safety</h2>
            <span className="text-xs text-red-400 font-mono tracking-widest">LIVE MONITORING</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'dashboard' ? 'bg-gray-800 text-white border-r-4 border-red-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Activity className="w-5 h-5" /> תמונת מצב
          </button>
          <button 
            onClick={() => setActiveTab('live_sessions')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'live_sessions' ? 'bg-gray-800 text-white border-r-4 border-red-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Video className="w-5 h-5" /> חדרים פעילים 
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-auto">12</span>
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'alerts' ? 'bg-gray-800 text-white border-r-4 border-red-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <AlertTriangle className="w-5 h-5" /> יומן התראות AI
            {simulatedAlert && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mr-auto animate-pulse">1</span>}
          </button>
          
          <div className="w-full h-px bg-gray-800 my-2"></div>
          
          {/* ניהול ואישור מטפלים */}
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'users' ? 'bg-gray-800 text-white border-r-4 border-red-500' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5" /> אישור מטפלים (KYC)
            {pendingProviders.filter(p => p.status === 'pending').length > 0 && (
              <span className="bg-yellow-500 text-gray-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full mr-auto">
                {pendingProviders.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-800 text-sm text-gray-500 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          מחובר כ: T&S Lead
        </div>
      </div>

      {/* אזור התוכן המרכזי */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        
        {/* כותרת עליונה */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg w-96">
            <Search className="w-5 h-5 text-gray-400" />
            <input type="text" placeholder="חיפוש מזהה פגישה או מטפל..." className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700" />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-6 h-6" />
              {simulatedAlert && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>}
            </button>
            <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
              TS
            </div>
          </div>
        </header>

        {/* תוכן מתחלף */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* פופ-אפ התראת AI חיה */}
          {simulatedAlert && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between overflow-hidden animate-in slide-in-from-top-4">
              <div className="flex items-start gap-4 p-5">
                <div className="bg-red-100 p-3 rounded-full mt-1">
                  <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-red-800 font-bold text-lg">התראת עקיפת מערכת (AI Detection)</h3>
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-mono">{simulatedAlert.time}</span>
                  </div>
                  <p className="text-red-700 text-sm mb-2">
                    זוהתה חריגה בחדר <strong>{simulatedAlert.id}</strong> בין המטפל <strong>{simulatedAlert.expert}</strong> ללקוח.
                  </p>
                  <div className="bg-white px-3 py-2 rounded-lg border border-red-200 text-sm font-mono text-gray-800 inline-block shadow-sm">
                    תמלול שזוהה: <span className="bg-yellow-200 font-bold px-1">{simulatedAlert.keyword}</span> <span className="text-gray-400 text-xs mr-2">(ודאות AI: {simulatedAlert.confidence})</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 p-5 bg-red-100/50 w-full md:w-auto h-full border-t md:border-t-0 md:border-r border-red-200 justify-center">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md">
                  <Eye className="w-4 h-4" /> הצטרף לחדר כצופה סמוי
                </button>
                <button onClick={() => setSimulatedAlert(null)} className="w-full bg-white border border-red-200 text-red-700 hover:bg-red-50 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors">
                  התעלם (False Alarm)
                </button>
              </div>
            </div>
          )}

          {/* טאב 1: תמונת מצב */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">תמונת מצב חיה</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { title: 'סשנים פעילים כרגע', value: '12', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { title: 'התראות AI היום', value: '3', color: 'text-red-600', bg: 'bg-red-50' },
                    { title: 'מטפלים אונליין (SOS)', value: '45', color: 'text-green-600', bg: 'bg-green-50' },
                    { title: 'עמלות שנצברו היום', value: '₪2,450', color: 'text-gray-800', bg: 'bg-gray-200' },
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                        <Activity className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                        <h3 className="text-gray-500 text-xs font-bold">{stat.title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* טאב 2: אישור מטפלים */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
              <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="font-bold text-gray-800 text-lg">בקרת איכות: אישור מטפלים חדשים</h2>
                <span className="text-sm text-gray-500">רק מטפלים מאושרים יורשו להציע שירות.</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-white text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-bold">מזהה ושם</th>
                      <th className="p-4 font-bold">תחום התמחות</th>
                      <th className="p-4 font-bold">תאריך הרשמה</th>
                      <th className="p-4 font-bold">סטטוס מסמכים</th>
                      <th className="p-4 font-bold text-center">פעולות אישור</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingProviders.map((provider) => (
                      <tr key={provider.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-gray-800">{provider.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{provider.id}</div>
                        </td>
                        <td className="p-4 text-gray-600">{provider.category}</td>
                        <td className="p-4 text-gray-600">{provider.date}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className={`text-xs flex items-center gap-1 font-bold ${provider.liveness ? 'text-green-600' : 'text-red-500'}`}>
                              {provider.liveness ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>} צילום חי (Liveness)
                            </span>
                            <span className={`text-xs flex items-center gap-1 font-bold ${provider.license ? 'text-green-600' : 'text-red-500'}`}>
                              {provider.license ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>} רישיון / תעודה
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {provider.status === 'approved' ? (
                            <span className="flex items-center justify-center gap-1 text-green-600 font-bold bg-green-50 py-2 rounded-lg">
                              <Check className="w-4 h-4" /> אושר
                            </span>
                          ) : provider.status === 'missing_docs' ? (
                            <span className="flex items-center justify-center gap-1 text-yellow-600 font-bold bg-yellow-50 py-2 rounded-lg">
                              חסרים מסמכים
                            </span>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button className="text-gray-500 hover:text-blue-600 transition-colors p-2 bg-gray-100 rounded-lg" title="צפה במסמכים">
                                <FileText className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => approveProvider(provider.id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                              >
                                אשר מטפל
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* טאב 3: יומן חריגות */}
          {activeTab === 'alerts' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h2 className="font-bold text-gray-800 text-lg">יומן חריגות AI ודוחות התנהגות</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-white text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-bold">זמן</th>
                      <th className="p-4 font-bold">סוג אירוע</th>
                      <th className="p-4 font-bold">מזהה חדר</th>
                      <th className="p-4 font-bold">סטטוס טיפול</th>
                      <th className="p-4 font-bold">פעולה</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-600">10:15</td>
                      <td className="p-4"><span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">כפתור מצוקה הופעל (SOS)</span></td>
                      <td className="p-4 font-mono text-gray-600">ROOM-992</td>
                      <td className="p-4"><span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4"/> טופל ע"י T&S-04</span></td>
                      <td className="p-4"><button className="text-blue-600 font-bold hover:underline">צפה בהקלטה המוצפנת</button></td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-600">09:30</td>
                      <td className="p-4"><span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">מילת מפתח חסומה (AI)</span></td>
                      <td className="p-4 font-mono text-gray-600">ROOM-104</td>
                      <td className="p-4 text-gray-500 font-medium">נסגר אוטומטית (ניתוק יזום)</td>
                      <td className="p-4"><button className="text-blue-600 font-bold hover:underline">פרטים מורחבים</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
