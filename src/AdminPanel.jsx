import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Users, Video, Activity, 
  Lock, Search, Eye, CheckCircle, Bell, FileText, XCircle, Check,
  Coins, Wallet, ArrowDownCircle, ArrowUpCircle, UserCog
} from 'lucide-react';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('club_bank'); // שיניתי שיתחיל בקופה כדי שתראה את זה מיד
  const [simulatedAlert, setSimulatedAlert] = useState(null);

  // נתוני דמו לאישור מטפלים (KYC)
  const [pendingProviders, setPendingProviders] = useState([
    { id: 'PROV-1042', name: 'דניאל כהן', category: 'פסיכולוגיה קלינית', date: 'היום, 10:45', liveness: true, license: true, status: 'pending' },
  ]);

  // נתוני דמו לשחקני המועדון (הכלכלה הסגורה)
  const [clubPlayers, setClubPlayers] = useState([
    { id: 'USR-881', name: 'יוסי המהמר', chips: 1250, debt: 0, creditLimit: 2000 },
    { id: 'USR-882', name: 'דני פוקר', chips: 0, debt: 1500, creditLimit: 5000 }, // שחקן במינוס
    { id: 'USR-883', name: 'אבי כהן', chips: 4500, debt: 0, creditLimit: 1000 },
  ]);

  const [managePlayer, setManagePlayer] = useState(null); // השחקן שכרגע פתוח לו המודל של הקופה
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [isCreditTransaction, setIsCreditTransaction] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      setLoginError('סיסמה שגויה. הניסיון תועד.');
    }
  };

  const approveProvider = (id) => {
    setPendingProviders(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
  };

  // פעולות קופת מועדון
  const handleLoadChips = () => {
    setClubPlayers(prev => prev.map(p => {
      if (p.id === managePlayer.id) {
        return {
          ...p,
          chips: p.chips + Number(transactionAmount),
          debt: isCreditTransaction ? p.debt + Number(transactionAmount) : p.debt // אם זה על החשבון (מינוס), החוב גדל
        };
      }
      return p;
    }));
    setManagePlayer(null);
    setTransactionAmount(0);
    setIsCreditTransaction(false);
  };

  const handleCashout = () => {
    setClubPlayers(prev => prev.map(p => {
      if (p.id === managePlayer.id) {
        // בפדיון - אם יש לו חוב, הקיזוז יורד קודם מהחוב
        let newChips = p.chips - Number(transactionAmount);
        return { ...p, chips: newChips < 0 ? 0 : newChips };
      }
      return p;
    }));
    setManagePlayer(null);
    setTransactionAmount(0);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8">
          <div className="text-center mb-8">
            <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white">VeriSess Admin</h1>
            <p className="text-gray-400 text-sm mt-2">גישה מוגבלת למורשים בלבד</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="הזן סיסמת מערכת" className="w-full bg-gray-950 text-white border border-gray-700 rounded-lg px-4 py-3 focus:border-red-500 outline-none transition" />
            {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition">אמת והיכנס</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans" dir="rtl">
      
      {/* תפריט צד (Sidebar) */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-red-500" />
          <h2 className="font-bold">Trust & Safety</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {['dashboard', 'users', 'alerts', 'live_sessions'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === tab ? 'bg-gray-800 border-r-4 border-red-500' : 'text-gray-400 hover:bg-gray-800'}`}>
              {tab === 'dashboard' && <Activity className="w-5 h-5"/>}
              {tab === 'users' && <Users className="w-5 h-5"/>}
              {tab === 'alerts' && <AlertTriangle className="w-5 h-5"/>}
              {tab === 'live_sessions' && <Video className="w-5 h-5"/>}
              {tab === 'dashboard' ? 'תמונת מצב' : tab === 'users' ? 'אישור מטפלים' : tab === 'alerts' ? 'יומן התראות' : 'חדרים פעילים'}
            </button>
          ))}
          
          <div className="w-full h-px bg-gray-800 my-2"></div>
          
          {/* הטאב החדש של מועדון הגיימינג */}
          <button onClick={() => setActiveTab('club_bank')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${activeTab === 'club_bank' ? 'bg-gray-800 border-r-4 border-amber-500 text-amber-500 font-bold' : 'text-amber-500/60 hover:bg-gray-800 hover:text-amber-500'}`}>
             <Coins className="w-5 h-5"/> ניהול קופת מועדון
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative">
        
        {/* ========================================================= */}
        {/* טאב קופת המועדון (Club Bank / Cashier) */}
        {/* ========================================================= */}
        {activeTab === 'club_bank' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Wallet className="text-amber-500"/> קופת מועדון הגיימינג</h2>
                <p className="text-gray-500">ניהול אסימונים וירטואליים ומסגרות אשראי לשחקנים בפוקר ורמיקוב.</p>
              </div>
              <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold border border-amber-200">
                סה"כ צ'יפים במשחק: {clubPlayers.reduce((acc, p) => acc + p.chips, 0).toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-sm">
                  <tr>
                    <th className="p-4 font-bold">שם שחקן</th>
                    <th className="p-4 font-bold">יתרת אסימונים (Chips)</th>
                    <th className="p-4 font-bold">חוב למועדון (מינוס)</th>
                    <th className="p-4 font-bold">מסגרת אשראי</th>
                    <th className="p-4 font-bold text-center">פעולות קופה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clubPlayers.map(player => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                        <UserCog className="w-5 h-5 text-gray-400"/> {player.name}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-900 text-amber-400 px-3 py-1 rounded-full font-mono font-bold shadow-inner">
                           {player.chips.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        {player.debt > 0 ? (
                          <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded border border-red-100">₪{player.debt.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400">אין חוב</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-500">עד ₪{player.creditLimit.toLocaleString()}</td>
                      <td className="p-4 flex justify-center gap-2">
                        <button onClick={() => setManagePlayer({ ...player, action: 'load' })} className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 shadow-sm">
                          <ArrowUpCircle className="w-4 h-4"/> הטען
                        </button>
                        <button onClick={() => setManagePlayer({ ...player, action: 'cashout' })} className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                          <ArrowDownCircle className="w-4 h-4"/> פדה (Cashout)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* מודל פעולת קופה (Popup) */}
        {managePlayer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-gray-200">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {managePlayer.action === 'load' ? <ArrowUpCircle className="text-teal-500"/> : <ArrowDownCircle className="text-red-500"/>}
                  {managePlayer.action === 'load' ? 'הטענת אסימונים לשחקן' : 'פדיון אסימונים'}
                </h3>
                <button onClick={() => setManagePlayer(null)} className="text-gray-400 hover:text-gray-800"><XCircle className="w-6 h-6"/></button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-1">שחקן: <strong>{managePlayer.name}</strong></p>
                <p className="text-gray-600 mb-4">יתרה נוכחית: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{managePlayer.chips}</span></p>
                
                <label className="block font-bold text-gray-700 mb-2">סכום:</label>
                <div className="relative">
                  <Coins className="absolute right-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input type="number" value={transactionAmount} onChange={(e) => setTransactionAmount(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pr-10 pl-4 font-mono text-lg focus:outline-none focus:border-amber-500" placeholder="0" />
                </div>
              </div>

              {managePlayer.action === 'load' && (
                <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={isCreditTransaction} onChange={(e) => setIsCreditTransaction(e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    <div>
                      <span className="font-bold text-blue-900 block">הטען על החשבון (מינוס / קרדיט)</span>
                      <span className="text-xs text-blue-700">השחקן לא העביר כסף. ירשם לו חוב למועדון.</span>
                    </div>
                  </label>
                </div>
              )}

              <button 
                onClick={managePlayer.action === 'load' ? handleLoadChips : handleCashout} 
                disabled={transactionAmount <= 0 || (managePlayer.action === 'cashout' && transactionAmount > managePlayer.chips)}
                className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-md transition-all ${managePlayer.action === 'load' ? 'bg-teal-500 hover:bg-teal-600' : 'bg-red-500 hover:bg-red-600'} disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {managePlayer.action === 'load' ? 'אשר הפקדה' : 'בצע משיכה (פדיון)'}
              </button>
            </div>
          </div>
        )}

        {/* שאר הטאבים (KYC וכו') */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="text-blue-500"/> אישור מטפלי VeriSess (KYC)</h2>
            <div className="divide-y">
              {pendingProviders.map((p) => (
                <div key={p.id} className="py-4 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  {p.status === 'approved' ? <span className="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-3 py-1 rounded-lg"><Check/> אושר ע"י T&S</span> : 
                   <button onClick={() => approveProvider(p.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm">אשר מטפל</button>}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
