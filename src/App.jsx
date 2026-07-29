import React, { useState, useEffect, useRef } from 'react';
import { app, auth, db, appId } from './firebase.js';
import VideoRoom from './VideoRoom.jsx';
import GroupRoom from './GroupRoom.jsx';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, query, where } from 'firebase/firestore';
import { LoginScreen, ProviderOnboarding, AdminPanel } from './Accounts.jsx';
import Checkout from './Checkout.jsx';
import MySessions from './MySessions.jsx';
import Home from './Home.jsx';
import { Terms, Privacy, AccessibilityPage, Contact, Footer } from './Legal.jsx';
import AccessibilityWidget from './Accessibility.jsx';
import { logout, isAdminUser } from './lib/auth.js';
import {
  ShieldCheck, LogOut, LayoutDashboard, Video, VideoOff, Mic, MicOff, 
  Clock, PhoneCall, MessageSquare, PenTool, AlertTriangle, Send, 
  Users, UserPlus, Crown, Gamepad2, Dices, Eraser, Trash2, Coins, 
  Eye, EyeOff, CheckCircle, Wallet, DollarSign, ArrowDownCircle, Lock, Activity,
  GraduationCap, HandCoins, X, CheckCircle2, ChevronRight, Search, FileText, Check,
  Bell, Upload, Camera, CreditCard, ChevronLeft, Filter, Star, Settings, Shield, Trophy, Play, ChevronDown, User, UserCheck
} from 'lucide-react';

// אתחול Firebase מרוכז ב-./firebase.js (app, auth, db, appId מיובאים למעלה).

// ==========================================
// 2. ווידג'טים משותפים
// ==========================================

const WhiteboardWidget = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState('pen');

  useEffect(() => {
    const initCanvas = () => {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = wrapper.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = 400 * dpr; 
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `400px`;
      const context = canvas.getContext('2d');
      context.scale(dpr, dpr);
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      contextRef.current = context;
    };
    setTimeout(initCanvas, 100);
    window.addEventListener('resize', initCanvas);
    return () => window.removeEventListener('resize', initCanvas);
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      contextRef.current.lineWidth = tool === 'eraser' ? 12 : 3;
    }
  }, [color, tool]);

  const startDrawing = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : e.touches ? e.touches[0].clientX - rect.left : 0;
    const y = e.clientY ? e.clientY - rect.top : e.touches ? e.touches[0].clientY - rect.top : 0;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : e.touches ? e.touches[0].clientX - rect.left : 0;
    const y = e.clientY ? e.clientY - rect.top : e.touches ? e.touches[0].clientY - rect.top : 0;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden" ref={wrapperRef}>
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['#000000', '#EF4444', '#3B82F6', '#10B981'].map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen'); }} className={`w-6 h-6 rounded-full border-2 ${color === c && tool === 'pen' ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          <button onClick={() => setTool('pen')} className={`p-1.5 rounded-md ${tool === 'pen' ? 'bg-teal-100 text-teal-700' : 'text-gray-600'}`}><PenTool className="w-4 h-4" /></button>
          <button onClick={() => setTool('eraser')} className={`p-1.5 rounded-md ${tool === 'eraser' ? 'bg-gray-200 text-gray-800' : 'text-gray-600'}`}><Eraser className="w-4 h-4" /></button>
        </div>
        <button onClick={clearCanvas} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
      </div>
      <div className="flex-1 relative cursor-crosshair touch-none bg-white">
        <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} onMouseLeave={finishDrawing} onTouchStart={startDrawing} onTouchEnd={finishDrawing} onTouchMove={draw} className="w-full h-full" />
      </div>
    </div>
  );
};

const PokerWidget = ({ isHost, mode = 'real' }) => {
  const [pot, setPot] = useState(1550);
  const [godMode, setGodMode] = useState(false);
  const [totalRake, setTotalRake] = useState(0);
  const RAKE_PERCENTAGE = 0.05; 

  const handleWinPot = () => {
    if (pot === 0) return;
    if (mode === 'real') {
      const rakeAmount = pot * RAKE_PERCENTAGE;
      setTotalRake(prev => prev + rakeAmount);
      alert(`שחקן ניצח! הקופה: ₪${pot}. עמלת מועדון (Rake): ₪${rakeAmount.toFixed(2)}`);
    } else {
      alert(`שחקן ניצח! חולקו ${pot} צ'יפים וירטואליים.`);
    }
    setPot(0); 
  };

  const Card = ({ value, suit, color, isHidden }) => (
    <div className={`w-14 h-20 rounded-lg shadow-md flex flex-col justify-between p-1 border-2 
      ${isHidden && !godMode ? 'bg-blue-900 border-white/20 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]' : 'bg-white border-gray-200'} 
      ${isHidden && godMode ? 'ring-2 ring-amber-400 border-transparent shadow-[0_0_15px_rgba(251,191,36,0.5)]' : ''}`}>
      {(!isHidden || godMode) && (<><div className={`text-xs font-bold ${color}`}>{value}</div><div className={`text-xl text-center ${color}`}>{suit}</div></>)}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative select-none" dir="ltr">
      <div className="bg-slate-900 p-3 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Crown className={`w-5 h-5 ${mode === 'real' ? 'text-amber-500' : 'text-blue-400'}`} />
          <div>
            <span className={`font-bold text-sm block ${mode === 'real' ? 'text-amber-500' : 'text-blue-400'}`}>PLO5 - {mode === 'real' ? 'High Stakes' : 'שיעור לימוד'}</span>
            <span className="text-[10px] text-slate-500 font-mono">{mode === 'real' ? 'REAL MONEY (Escrow)' : 'PLAY MONEY (Virtual)'}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {isHost && mode === 'real' && (
            <div className="bg-green-900/30 border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-green-400" /><span className="text-green-400 text-xs font-bold">Rake: ₪{totalRake.toFixed(0)}</span>
            </div>
          )}
          {isHost && mode === 'play' && (
            <button onClick={() => alert("חולקו צ'יפים")} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-sm">
              <HandCoins className="w-3 h-3" /> חלק צ'יפים
            </button>
          )}
          {isHost && (
            <button onClick={() => setGodMode(!godMode)} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${godMode ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {godMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} God Mode
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 bg-green-900 relative p-4 flex flex-col justify-between" style={{ backgroundImage: "radial-gradient(circle, #065f46 0%, #022c22 100%)" }}>
        <div className="flex flex-col items-center gap-2">
          <div className="flex -space-x-4">
            <Card isHidden={true} value="A" suit="♥️" color="text-red-600" /><Card isHidden={true} value="K" suit="♣️" color="text-black" /><Card isHidden={true} value="Q" suit="♦️" color="text-red-600" /><Card isHidden={true} value="J" suit="♠️" color="text-black" /><Card isHidden={true} value="10" suit="♥️" color="text-red-600" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 my-4">
          <div className="bg-black/50 border border-amber-500/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md cursor-pointer hover:bg-black/70 transition-colors" onClick={handleWinPot} title="לחץ לסימולציית זכייה">
            <Coins className={`w-4 h-4 ${mode === 'real' ? 'text-amber-400' : 'text-blue-300'}`} />
            <span className={`font-black tracking-wider ${mode === 'real' ? 'text-amber-400' : 'text-blue-300'}`}>{mode === 'real' ? '₪' : 'Chips: '}{pot.toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <Card value="8" suit="♠️" color="text-black" /><Card value="9" suit="♦️" color="text-red-600" /><Card value="2" suit="♣️" color="text-black" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex -space-x-4">
            <Card value="A" suit="♠️" color="text-black" /><Card value="A" suit="♦️" color="text-red-600" /><Card value="K" suit="♠️" color="text-black" /><Card value="4" suit="♥️" color="text-red-600" /><Card value="2" suit="♦️" color="text-red-600" />
          </div>
        </div>
      </div>
      <div className="bg-slate-900 p-3 border-t border-slate-800 grid grid-cols-3 gap-2">
        <button className="bg-red-950/50 text-red-500 text-sm font-bold py-3 rounded-lg border border-red-900/50 hover:bg-red-900/80 transition-colors">Fold</button>
        <button className="bg-slate-800 text-slate-300 text-sm font-bold py-3 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">Check</button>
        <button onClick={() => setPot(p => p + 200)} className={`text-slate-950 text-sm font-black py-3 rounded-lg shadow-lg transition-transform active:scale-95 ${mode === 'real' ? 'bg-gradient-to-t from-amber-600 to-amber-400' : 'bg-gradient-to-t from-blue-500 to-blue-300'}`}>Bet (200)</button>
      </div>
    </div>
  );
};

// ==========================================
// 3. מסכים פנימיים
// ==========================================

const Marketplace = ({ onSelectExpert }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sosOnly, setSosOnly] = useState(false);

  const categories = [
    { id: 'all', name: 'הכל' },
    { id: 'law', name: 'משפט ועריכת דין' },
    { id: 'psychology', name: 'פסיכולוגיה' },
    { id: 'sleep', name: 'ייעוץ שינה והורות' },
    { id: 'addiction', name: 'גמילה' },
    { id: 'gaming', name: 'חדרי משחק (פוקר/D&D)' },
    { id: 'mysticism', name: 'רוחניות ותקשור' }
  ];

  // קריאה חיה של מומחים מאושרים מ-Firestore (collection: providers).
  // כל עוד אין נתונים — מציגים רשימת ברירת מחדל.
  const FALLBACK_EXPERTS = [
    { id: 'e1', displayName: 'ד"ר יעל שרת', category: 'psychology', rate: 450, isOnline: true, rating: '5.0', tags: ['דיכאון', 'חרדה'] },
    { id: 'e2', displayName: 'עו"ד דניאל כהן', category: 'law', rate: 600, isOnline: false, rating: '4.8', tags: ['גירושין', 'משמורת'] },
    { id: 'e3', displayName: 'שולחן פוקר קבוצתי', category: 'gaming', rate: 100, isOnline: true, rating: '4.9', tags: ['PLO5', 'Cash Game'] }
  ];
  const [experts, setExperts] = useState(FALLBACK_EXPERTS);
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'providers'), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((p) => p.status === 'approved');
      if (list.length) setExperts(list);
    }, (err) => console.error('[VeriSess] טעינת מומחים נכשלה:', err));
    return () => unsub();
  }, []);

  // דירוגים אמיתיים — ממוצע מתוך אוסף reviews
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, 'reviews'), (snap) => setReviews(snap.docs.map((d) => d.data())), () => {});
    return () => unsub();
  }, []);
  const ratingMap = {};
  reviews.forEach((r) => { (ratingMap[r.providerId] = ratingMap[r.providerId] || []).push(Number(r.rating) || 0); });
  const ratingOf = (id, fallback) => {
    const arr = ratingMap[id];
    if (!arr || !arr.length) return { val: fallback, count: 0 };
    return { val: (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1), count: arr.length };
  };

  const filteredExperts = experts.filter(expert => {
    const matchesCategory = selectedCategory === 'all' || expert.category === selectedCategory;
    const matchesSos = sosOnly ? expert.isOnline === true : true;
    return matchesCategory && matchesSos;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12" dir="rtl">
      <div className="bg-blue-900 text-white pt-12 pb-8 px-4 rounded-b-3xl shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none"><ShieldCheck className="w-64 h-64 -mt-10 -mr-10" /></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">מצא את המומחה שאתה צריך. <span className="text-teal-400">עכשיו.</span></h1>
          <p className="text-blue-200 mb-8 max-w-2xl mx-auto">מערכת VeriSess מבטיחה לך שיחות וידאו מאובטחות, מוצפנות ופרטיות לחלוטין עם המומחים המובילים בישראל.</p>
          <div className="bg-white rounded-full p-2 flex items-center shadow-xl max-w-2xl mx-auto">
            <div className="bg-blue-50 p-3 rounded-full text-blue-900 mr-1"><Search className="w-5 h-5" /></div>
            <input type="text" placeholder="חפש תחום, שם מטפל או מילת מפתח..." className="flex-1 bg-transparent border-none focus:outline-none text-gray-800 px-4 placeholder-gray-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full font-bold transition-colors ml-1 hidden md:block">חפש</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Filter className="w-5 h-5 text-teal-500" /> סינון תוצאות</h3>
            <div className="mb-6 bg-red-50 p-4 rounded-xl border border-red-100">
              <label className="flex items-center justify-between cursor-pointer">
                <div><span className="block font-bold text-red-700 text-sm">זמינים עכשיו (SOS)</span><span className="text-xs text-red-500">התחל שיחה תוך דקה</span></div>
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
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat.id ? 'bg-blue-50 text-blue-900 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}>{cat.name}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-4 flex justify-between items-end">
            <h2 className="text-xl font-bold text-gray-800">תוצאות חיפוש <span className="text-gray-400 font-normal text-sm">({filteredExperts.length} נמצאו)</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExperts.map(expert => (
              <div key={expert.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                {expert.isOnline && (
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>זמין עכשיו
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-3xl font-bold border border-gray-100">{expert.displayName.charAt(0)}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1">{expert.displayName}<ShieldCheck className="w-4 h-4 text-teal-500" title="פרופיל מאומת" /></h3>
                    <p className="text-gray-500 text-sm mb-2">{categories.find(c => c.id === expert.category)?.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1 font-medium text-amber-500"><Star className="w-4 h-4 fill-current" /> {ratingOf(expert.id, expert.rating).val}{ratingOf(expert.id).count > 0 && <span className="text-gray-400 font-normal">({ratingOf(expert.id).count})</span>}</div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> 45 דק'</div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="font-bold text-xl text-teal-600">₪{expert.rate}</div>
                  <button onClick={() => onSelectExpert && onSelectExpert(expert)} className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 ${expert.isOnline ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'}`}>
                    {expert.isOnline ? <><PhoneCall className="w-4 h-4" /> שיחת SOS</> : <><Video className="w-4 h-4" /> תאם פגישה</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Checkout מיובא כרכיב אמיתי (סליקת טרנזילה) מ-./Checkout.jsx

// VideoRoom ו-GroupRoom מיובאים כקומפוננטות אמיתיות מהקבצים הנפרדים (ראה imports למעלה).

// AdminPanel ו-ProviderOnboarding מיובאים כרכיבים אמיתיים מ-./Accounts.jsx

const ProviderDashboard = ({ user, onRegister }) => {
  const [profile, setProfile] = useState(undefined); // undefined=טוען, null=אין
  const [bookings, setBookings] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || !db) return;
    const unsubP = onSnapshot(doc(db, 'providers', user.uid), (s) => setProfile(s.exists() ? s.data() : null));
    const q = query(collection(db, 'bookings'), where('providerId', '==', user.uid));
    const unsubB = onSnapshot(q, (s) => setBookings(s.docs.map((d) => ({ id: d.id, ...d.data() }))), () => {});
    return () => { unsubP(); unsubB(); };
  }, [user]);

  const isOnline = profile?.isOnline || false;
  const toggleOnline = async () => {
    if (!user || !profile) return;
    setBusy(true);
    try { await updateDoc(doc(db, 'providers', user.uid), { isOnline: !isOnline }); } catch (e) { console.error(e); }
    setBusy(false);
  };

  const paid = bookings.filter((b) => b.status === 'paid');
  const gross = paid.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  const net = Math.round(gross * 0.8); // אחרי עמלת פלטפורמה 20%

  const Wrap = ({ children }) => (
    <div className="min-h-screen bg-gray-50 font-sans pb-12" dir="rtl">
      <main className="max-w-4xl mx-auto px-4 pt-8">{children}</main>
    </div>
  );

  if (!user) return <Wrap><p className="text-gray-500 text-center mt-10">נדרשת התחברות.</p></Wrap>;
  if (profile === undefined) return <Wrap><p className="text-gray-400 text-center mt-10">טוען…</p></Wrap>;
  if (profile === null) {
    return (
      <Wrap>
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center max-w-md mx-auto mt-8">
          <ShieldCheck className="w-14 h-14 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">עדיין לא נרשמת כמומחה</h2>
          <p className="text-gray-500 mb-6">מלא פרופיל קצר כדי להופיע בקטלוג ולהתחיל לקבל פגישות.</p>
          <button onClick={onRegister} className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800">להרשמת מומחה</button>
        </div>
      </Wrap>
    );
  }

  const statusBadge = profile.status === 'approved'
    ? <span className="text-green-600 bg-green-50 border border-green-200 text-xs font-bold px-2 py-1 rounded-full">מאושר</span>
    : <span className="text-amber-600 bg-amber-50 border border-amber-200 text-xs font-bold px-2 py-1 rounded-full">ממתין לאישור</span>;

  return (
    <Wrap>
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">שלום, {profile.displayName} {statusBadge}</h1>
          <p className="text-gray-500">לוח הבקרה שלך.</p>
        </div>
        <button onClick={toggleOnline} disabled={busy || profile.status !== 'approved'} className={`p-4 rounded-2xl flex items-center gap-4 border-2 transition-all disabled:opacity-60 ${isOnline ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'}`}>
          <span className={`font-bold ${isOnline ? 'text-green-700' : 'text-gray-500'}`}>{isOnline ? 'זמין עכשיו (SOS)' : 'לא זמין'}</span>
          <div className={`w-14 h-7 rounded-full relative transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}>
            <div className={`absolute top-[2px] w-6 h-6 bg-white rounded-full transition-all ${isOnline ? 'right-[2px]' : 'right-[26px]'}`}></div>
          </div>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Wallet className="text-blue-700" /></div>
          <p className="text-gray-500 font-bold mb-1">יתרה למשיכה (נטו)</p>
          <h3 className="text-3xl font-black">₪{net.toLocaleString()}</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="bg-teal-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><CheckCircle className="text-teal-700" /></div>
          <p className="text-gray-500 font-bold mb-1">פגישות ששולמו</p>
          <h3 className="text-3xl font-black">{paid.length}</h3>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><DollarSign className="text-purple-700" /></div>
          <p className="text-gray-500 font-bold mb-1">מחזור (ברוטו)</p>
          <h3 className="text-3xl font-black">₪{gross.toLocaleString()}</h3>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">הפגישות שלי ({bookings.length})</h3>
        {bookings.length === 0 && <p className="text-gray-400 text-sm">עדיין אין פגישות.</p>}
        <div className="space-y-2">
          {bookings.slice(0, 10).map((b) => (
            <div key={b.id} className="flex justify-between items-center border-b border-gray-50 py-2 text-sm">
              <span className="text-gray-700">{b.clientEmail || 'לקוח'} · {b.sessionType}</span>
              <span className="font-bold text-teal-600">₪{b.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </Wrap>
  );
};

const PokerLobby = () => {
  return (
    <div className="bg-slate-950 text-white min-h-[90vh] flex flex-col p-8 font-sans" dir="rtl">
        <div className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-6">
            <div className="w-16 h-16 bg-slate-900 border border-amber-500 rounded-2xl flex items-center justify-center"><Crown className="text-amber-500 w-8 h-8"/></div>
            <div>
                <h1 className="text-3xl font-black text-amber-500">CLUB VERISESS</h1>
                <p className="text-slate-400">מועדון משחקים סגור</p>
            </div>
        </div>
        <div className="grid grid-cols-1 gap-4 max-w-3xl">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
                <div><h3 className="text-xl font-bold text-white mb-1">השולחן של עמית <Lock className="inline w-4 h-4 text-slate-500"/></h3><p className="text-amber-500/80 font-mono text-sm">PLO 5 | Blinds: 5/10</p></div>
                <button className="bg-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:bg-amber-500">הצטרף</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
                <div><h3 className="text-xl font-bold text-white mb-1">High Stakes IL</h3><p className="text-amber-500/80 font-mono text-sm">NLH | Blinds: 50/100</p></div>
                <button className="bg-amber-600 text-black font-bold px-6 py-3 rounded-xl hover:bg-amber-500">הצטרף</button>
            </div>
        </div>
    </div>
  );
};

// ==========================================
// 6. הנתב המרכזי
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('welcome');
  const [testSessionId, setTestSessionId] = useState(`sess_${Date.now()}`);
  const [selectedExpertId, setSelectedExpertId] = useState(null);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [roomCategory, setRoomCategory] = useState('therapy');
  const [authUser, setAuthUser] = useState(null);

  // התחברות אנונימית אוטומטית — כל מבקר מקבל זהות אמיתית (uid) לצ'אט/וידאו/ארנק
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setAuthUser(user);
      else signInAnonymously(auth).catch((e) => console.error('[VeriSess] התחברות אנונימית נכשלה:', e));
    });
    return () => unsub();
  }, []); 

  const GlobalNavbar = () => (
    <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40" dir="rtl">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('welcome')}>
        <ShieldCheck className="w-8 h-8 text-blue-900" />
        <span className="text-2xl font-bold text-blue-900">Veri<span className="text-teal-500">Sess</span></span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setCurrentView('marketplace')} className="text-sm font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-colors">
          חיפוש מומחה
        </button>
        {authUser && (
          <button onClick={() => setCurrentView('mySessions')} className="text-sm font-bold text-gray-600 hover:text-blue-900 px-3 py-2">הפגישות שלי</button>
        )}
        {isAdminUser(authUser) && (
          <button onClick={() => setCurrentView('admin')} className="text-sm font-bold text-red-600 hover:text-red-700 px-3 py-2">אדמין</button>
        )}
        {authUser && !authUser.isAnonymous ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:block">{authUser.displayName || authUser.email}</span>
            <button onClick={() => { logout(); setCurrentView('welcome'); }} className="text-sm font-bold text-gray-500 hover:text-red-500 px-3 py-2">יציאה</button>
          </div>
        ) : (
          <button onClick={() => setCurrentView('login')} className="text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors">
            כניסה / הרשמה
          </button>
        )}
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {currentView !== 'videoRoom' && <GlobalNavbar />}

      {currentView === 'welcome' && <Home onFindExpert={() => setCurrentView('marketplace')} onProviderSignup={() => setCurrentView('onboarding')} />}

      {currentView === 'marketplace' && <Marketplace onSelectExpert={(expert) => { setSelectedExpert(expert); setSelectedExpertId(expert?.id); setRoomCategory(expert?.category === 'gaming' ? 'gaming' : 'therapy'); setCurrentView('checkout'); }} />}
      {currentView === 'login' && <LoginScreen onDone={() => setCurrentView('marketplace')} />}
      {currentView === 'onboarding' && <ProviderOnboarding user={authUser} onComplete={() => setCurrentView('dashboard')} />}
      {currentView === 'dashboard' && <ProviderDashboard user={authUser} onRegister={() => setCurrentView('onboarding')} />}
      {currentView === 'checkout' && <Checkout expert={selectedExpert} user={authUser} onCancel={() => setCurrentView('marketplace')} onSuccess={(sessionId) => { setTestSessionId(sessionId); setCurrentView('videoRoom'); }} />}
      {currentView === 'mySessions' && <MySessions user={authUser} onFindExpert={() => setCurrentView('marketplace')} onEnterRoom={(b) => { setTestSessionId(b.sessionId || `sess_${b.id}`); setRoomCategory(b.category === 'gaming' ? 'gaming' : 'therapy'); setCurrentView('videoRoom'); }} />}
      {currentView === 'videoRoom' && (roomCategory === 'group'
        ? <GroupRoom sessionId={testSessionId} onLeave={() => setCurrentView('mySessions')} isHost={false} />
        : <VideoRoom sessionId={testSessionId} onLeave={() => setCurrentView('mySessions')} isProvider={false} category={roomCategory} />)}
      {currentView === 'admin' && <AdminPanel user={authUser} />}
      {currentView === 'poker_lobby' && <PokerLobby />}
      {currentView === 'terms' && <Terms />}
      {currentView === 'privacy' && <Privacy />}
      {currentView === 'accessibility' && <AccessibilityPage />}
      {currentView === 'contact' && <Contact />}

      {currentView !== 'videoRoom' && currentView !== 'checkout' && <Footer onNav={setCurrentView} />}

      {/* סרגל נגישות — בכל דף (ת"י 5568) */}
      <AccessibilityWidget onStatement={() => setCurrentView('accessibility')} />
    </div>
  );
}
