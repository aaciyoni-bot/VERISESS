import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion, collection, setDoc } from 'firebase/firestore';
import { 
  ShieldCheck, LogOut, LayoutDashboard, Video, VideoOff, Mic, MicOff, 
  Clock, PhoneCall, MessageSquare, PenTool, AlertTriangle, Send, 
  Users, UserPlus, Crown, Gamepad2, Dices, Eraser, Trash2, Coins, 
  Eye, EyeOff, CheckCircle, Wallet, DollarSign, ArrowDownCircle, Lock, Activity,
  GraduationCap, HandCoins, X, CheckCircle2, ChevronRight, Search, FileText, Check,
  Bell, Upload, Camera, CreditCard, ChevronLeft, Filter, Star, Settings, Shield, Trophy, Play, ChevronDown, User, UserCheck
} from 'lucide-react';

// ==========================================
// 1. אתחול Firebase
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

  const experts = [
    { id: 'e1', displayName: 'ד"ר יעל שרת', category: 'psychology', rate: 450, isOnline: true, rating: '5.0', tags: ['דיכאון', 'חרדה'] },
    { id: 'e2', displayName: 'עו"ד דניאל כהן', category: 'law', rate: 600, isOnline: false, rating: '4.8', tags: ['גירושין', 'משמורת'] },
    { id: 'e3', displayName: 'שולחן פוקר קבוצתי', category: 'gaming', rate: 100, isOnline: true, rating: '4.9', tags: ['PLO5', 'Cash Game'] }
  ];

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
                      <div className="flex items-center gap-1 font-medium text-amber-500"><Star className="w-4 h-4 fill-current" /> {expert.rating}</div>
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> 45 דק'</div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="font-bold text-xl text-teal-600">₪{expert.rate}</div>
                  <button onClick={() => onSelectExpert && onSelectExpert(expert.id, expert.category === 'gaming' ? 'gaming' : 'therapy')} className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 ${expert.isOnline ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20' : 'bg-blue-50 text-blue-900 hover:bg-blue-100'}`}>
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

const ClientCheckout = ({ expertId, onCancel, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(3); }, 2000);
  };

  const handleEnterRoom = () => { if (onSuccess) onSuccess(`sess_${Date.now()}`); };

  return (
    <div className="max-w-md mx-auto w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100" dir="rtl">
      <div className="bg-gray-900 p-6 text-white text-center relative">
        {onCancel && <button onClick={onCancel} className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors text-sm font-bold">חזור</button>}
        <ShieldCheck className="w-12 h-12 text-teal-500 mx-auto mb-2" />
        <h2 className="text-xl font-bold">הפקדה מאובטחת</h2>
        <p className="text-gray-400 text-xs mt-1">הסכום יישמר בנאמנות עד סיום הפגישה</p>
      </div>
      {step < 3 && (
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 flex justify-between items-center"><span className="font-bold text-gray-700">סכום לתשלום:</span><span className="font-black text-2xl text-blue-900">₪250</span></div>
              <div className="space-y-3">
                <input type="text" placeholder="מספר כרטיס אשראי" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500" />
                <div className="flex gap-2">
                  <input type="text" placeholder="MM/YY" className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500" />
                  <input type="text" placeholder="CVV" className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500" />
                </div>
              </div>
              <button onClick={handleCheckout} disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 shadow-md">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'אשר הפקדה'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8"><div className="w-16 h-16 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div><p className="text-gray-600 font-bold">מעבד תשלום מאובטח...</p></div>
          )}
        </div>
      )}
      {step === 3 && (
        <div className="p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-green-600" /></div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">התשלום בוצע בהצלחה!</h3>
          <button onClick={handleEnterRoom} className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition-colors shadow-md mt-4">היכנס לחדר עכשיו</button>
        </div>
      )}
    </div>
  );
};

const VideoRoom = ({ sessionId, onLeave, isProvider = true, category = 'therapy' }) => {
  const [activeTab, setActiveTab] = useState(category === 'therapy' ? 'chat' : 'poker'); 
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  return (
    <div className="max-w-7xl mx-auto my-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl h-[85vh] flex relative border border-gray-800" dir="rtl">
      <div className="flex-1 relative bg-black flex flex-col overflow-hidden">
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20">
          <div className="bg-gray-800/80 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-700 text-sm"><ShieldCheck className="w-4 h-4 text-teal-400" /> חדר וירטואלי</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full flex flex-col md:flex-row gap-4 p-8">
             <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center"><User className="w-20 h-20 text-gray-600"/></div>
             <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center relative">
               <User className="w-20 h-20 text-gray-600"/>
               <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-xs">אתה</div>
             </div>
          </div>
        </div>
        <div className="bg-gray-900/95 p-4 flex justify-center gap-4 border-t border-gray-800">
          <button onClick={() => setMicEnabled(!micEnabled)} className={`p-4 rounded-xl ${micEnabled ? 'bg-gray-800 text-white' : 'bg-red-500/20 text-red-500'}`}>{micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}</button>
          <button onClick={() => setCameraEnabled(!cameraEnabled)} className={`p-4 rounded-xl ${cameraEnabled ? 'bg-gray-800 text-white' : 'bg-red-500/20 text-red-500'}`}>{cameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}</button>
          <button onClick={onLeave} className="px-8 py-4 bg-red-600 text-white font-bold flex items-center gap-2 rounded-xl"><PhoneCall className="w-5 h-5 transform rotate-[135deg]" /> עזוב</button>
        </div>
      </div>
      <div className="w-[400px] bg-gray-50 flex flex-col border-l border-gray-200">
        <div className="flex bg-white border-b border-gray-200 p-1">
          <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeTab === 'chat' ? 'bg-blue-50 text-blue-700' : 'text-gray-500'}`}>צ'אט</button>
          <button onClick={() => setActiveTab('whiteboard')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeTab === 'whiteboard' ? 'bg-teal-50 text-teal-700' : 'text-gray-500'}`}>לוח</button>
          <button onClick={() => setActiveTab('poker')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${activeTab === 'poker' ? 'bg-amber-100 text-amber-700' : 'text-gray-500'}`}>פוקר</button>
        </div>
        <div className="flex-1 overflow-hidden p-2">
          {activeTab === 'chat' && <div className="h-full flex flex-col justify-end p-4"><div className="bg-white border rounded-full p-1 flex"><input type="text" placeholder="הודעה..." className="flex-1 px-3 outline-none"/><button className="bg-teal-500 p-2 rounded-full text-white"><Send className="w-4 h-4"/></button></div></div>}
          {activeTab === 'whiteboard' && <WhiteboardWidget />}
          {activeTab === 'poker' && <div className="h-full w-full bg-slate-950 rounded-xl relative p-1"><PokerWidget isHost={isProvider} mode={category === 'class' ? 'play' : 'real'} /></div>}
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex p-8 justify-center items-center font-sans" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
            <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">פאנל אדמין פעיל</h2>
            <p className="text-gray-500">לצורך סביבת ההדגמה והפעלת המערכת המאוחדת, פאנל הניהול מכווץ כאן. בקבצים הנפרדים שמרנו את הגרסה המלאה הכוללת אישורי KYC.</p>
        </div>
    </div>
  );
};

const ProviderOnboarding = ({ onComplete }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans" dir="rtl">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100">
        <ShieldCheck className="w-16 h-16 text-teal-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">הרשמת מטפלים (KYC)</h2>
        <p className="text-gray-500 mb-8">סימולציית העלאת מסמכים לאישור מערכת.</p>
        <button onClick={onComplete} className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors shadow-md">
          סיים הרשמה ומעבר לדאשבורד
        </button>
      </div>
    </div>
  );
};

const ProviderDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12" dir="rtl">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2"><ShieldCheck className="w-8 h-8 text-blue-900" /><span className="font-bold text-xl text-blue-900">VeriSess Provider</span></div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold">שלום, מומחה</h1>
                <p className="text-gray-500">לוח הבקרה שלך מוכן.</p>
            </div>
            <div className={`p-4 rounded-2xl flex items-center gap-4 transition-all border-2 ${isOnline ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200'}`}>
                <span className={`font-bold ${isOnline ? 'text-green-700' : 'text-gray-500'}`}>{isOnline ? 'מחובר (SOS)' : 'לא זמין כעת'}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all"></div>
                </label>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Wallet className="text-blue-700"/></div>
                <p className="text-gray-500 font-bold mb-1">יתרה למשיכה</p>
                <h3 className="text-3xl font-black">₪2,450.00</h3>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4"><Clock className="text-purple-700"/></div>
                <p className="text-gray-500 font-bold mb-1">פגישות קרובות</p>
                <h3 className="text-xl font-bold">אין פגישות מתוזמנות.</h3>
            </div>
        </div>
      </main>
    </div>
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
  const [roomCategory, setRoomCategory] = useState('therapy'); 

  const DevNavigationBar = () => (
    <div className="bg-gray-900 text-gray-300 text-xs py-2 px-4 flex flex-wrap gap-4 items-center justify-center border-b-4 border-red-500 shadow-md" dir="rtl">
      <span className="font-bold text-white flex items-center gap-1">
        <LayoutDashboard className="w-4 h-4 text-red-500"/> תפריט פיתוח:
      </span>
      <button onClick={() => setCurrentView('welcome')} className="hover:text-white transition-colors">בית</button><span>|</span>
      <button onClick={() => setCurrentView('marketplace')} className="hover:text-white transition-colors">מרקטפלייס (לקוח)</button><span>|</span>
      <button onClick={() => setCurrentView('onboarding')} className="hover:text-white transition-colors">הרשמת מטפל</button><span>|</span>
      <button onClick={() => setCurrentView('dashboard')} className="hover:text-white transition-colors">דאשבורד מטפל</button><span>|</span>
      <button onClick={() => setCurrentView('poker_lobby')} className="text-amber-400 font-bold hover:text-amber-300 transition-colors">מועדון פוקר</button><span>|</span>
      <button onClick={() => setCurrentView('admin')} className="text-red-400 font-bold hover:text-red-300 transition-colors bg-red-900/30 px-2 py-1 rounded">אדמין</button>
    </div>
  );

  const GlobalNavbar = () => (
    <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40" dir="rtl">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('welcome')}>
        <ShieldCheck className="w-8 h-8 text-blue-900" />
        <span className="text-2xl font-bold text-blue-900">Veri<span className="text-teal-500">Sess</span></span>
      </div>
      <button onClick={() => setCurrentView('marketplace')} className="text-sm font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 px-4 py-2 rounded-lg transition-colors">
        חיפוש מומחה
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <DevNavigationBar />
      
      {currentView !== 'welcome' && currentView !== 'videoRoom' && currentView !== 'admin' && currentView !== 'poker_lobby' && <GlobalNavbar />}

      {currentView === 'welcome' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-900 to-gray-900" dir="rtl">
          <div className="text-center mb-16 animate-in fade-in zoom-in duration-700">
            <ShieldCheck className="w-24 h-24 text-teal-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]" />
            <h1 className="text-6xl font-black text-white mb-4 tracking-tight">Veri<span className="text-teal-400">Sess</span></h1>
            <p className="text-xl text-blue-200 max-w-lg mx-auto">קליניקה וירטואלית מאובטחת. מפגשי ייעוץ 1-על-1 ושיחות SOS, מוצפנים מקצה לקצה.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            <div className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 flex flex-col items-center text-center cursor-pointer hover:-translate-y-2 transition-transform duration-300" onClick={() => setCurrentView('marketplace')}>
              <h2 className="text-3xl font-bold text-blue-900 mb-4">אני מחפש שירות</h2>
              <p className="text-gray-500 mb-8">איתור מומחים זמינים לשיחת וידאו מיידית. סליקה מאובטחת ושמירה על פרטיות מלאה.</p>
              <button className="mt-auto w-full bg-teal-500 text-white font-bold py-4 rounded-xl shadow-lg text-lg">היכנס כלקוח</button>
            </div>
            <div className="bg-blue-800 rounded-3xl p-10 shadow-2xl border border-blue-700 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-white mb-4">אני מומחה / מטפל</h2>
              <p className="text-blue-200 mb-8">הגדרת קליניקה דיגיטלית ב-5 דקות. אימות זהות (KYC), יומן מתקדם וכפתור זמינות SOS.</p>
              <div className="mt-auto w-full flex flex-col gap-3">
                <button onClick={() => setCurrentView('onboarding')} className="w-full bg-white text-blue-900 font-bold py-4 rounded-xl shadow-md text-lg">בקשת הצטרפות</button>
                <button onClick={() => setCurrentView('dashboard')} className="w-full bg-transparent text-white border border-blue-600 font-bold py-3 rounded-xl">כניסת רשומים ללוח הבקרה</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'marketplace' && <Marketplace onSelectExpert={(expertId, category) => { setSelectedExpertId(expertId); setRoomCategory(category); setCurrentView('checkout'); }} />}
      {currentView === 'onboarding' && <ProviderOnboarding onComplete={() => setCurrentView('dashboard')} />}
      {currentView === 'dashboard' && <ProviderDashboard />}
      {currentView === 'checkout' && <div className="p-8 flex-1 bg-gray-50 flex items-center justify-center"><ClientCheckout expertId={selectedExpertId} onCancel={() => setCurrentView('marketplace')} onSuccess={(sessionId) => { setTestSessionId(sessionId); setCurrentView('videoRoom'); }} /></div>}
      {currentView === 'videoRoom' && <VideoRoom sessionId={testSessionId} onLeave={() => setCurrentView('welcome')} isProvider={false} category={roomCategory} />}
      {currentView === 'admin' && <AdminPanel />}
      {currentView === 'poker_lobby' && <PokerLobby />}

    </div>
  );
}
