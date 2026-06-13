import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { 
  ShieldCheck, LogOut, LayoutDashboard, Video, VideoOff, Mic, MicOff, 
  Clock, PhoneCall, MessageSquare, PenTool, AlertTriangle, Send, 
  Users, UserPlus, Crown, Gamepad2, Dices, Eraser, Trash2, Coins, 
  Eye, EyeOff, CheckCircle, Wallet, DollarSign, ArrowDownCircle, Lock, Activity
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
// 2. מסכי המערכת השונים
// ==========================================

const Marketplace = ({ onSelectExpert }) => (
  <div className="p-8 max-w-6xl mx-auto min-h-screen" dir="rtl">
    <h2 className="text-3xl font-bold text-blue-900 mb-6 flex items-center gap-2">
      <ShieldCheck className="w-8 h-8 text-teal-500" />
      קטלוג מומחים ומועדונים (Live)
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-3xl mb-4 shadow-sm">
            {i === 1 ? 'ד' : i === 2 ? 'ע' : 'ק'}
          </div>
          <h3 className="text-xl font-bold text-gray-800">{i === 1 ? 'ד"ר יעל שרת' : i === 2 ? 'עו"ד דניאל כהן' : 'קלאב פוקר VIP'}</h3>
          <p className="text-gray-500 text-sm mb-2">{i === 1 ? 'פסיכולוגיה קלינית' : i === 2 ? 'דיני משפחה' : 'PLO5 & Texas Hold\'em'}</p>
          <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-50 px-3 py-1 rounded-full mb-6">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> זמין להצטרפות
          </div>
          <button onClick={() => onSelectExpert(`expert_${i}`, i === 3 ? 'gaming' : 'therapy')} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md">
            {i === 3 ? 'הצטרף לשולחן (₪500)' : `התייעץ עכשיו (₪${150 + (i * 50)})`}
          </button>
        </div>
      ))}
    </div>
  </div>
);

const ProviderOnboarding = () => (
  <div className="p-8 max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-xl border border-gray-100 text-center" dir="rtl">
    <ShieldCheck className="w-16 h-16 text-blue-900 mx-auto mb-4" />
    <h2 className="text-2xl font-bold mb-2">בקשת פתיחת מועדון/קליניקה</h2>
    <p className="text-gray-500 text-sm mb-6">מילוי פרטים לאימות קפדני (KYC)</p>
    <input type="text" placeholder="שם מלא / שם המועדון" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-blue-500" />
    <input type="text" placeholder="מספר רישיון / פרטי ארנק" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-blue-500" />
    <button className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors">שלח לאישור מנהל</button>
  </div>
);

const ProviderDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 min-h-screen" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">דאשבורד מנהל מועדון/קליניקה</h1>
          <p className="text-gray-500">ניהול הכנסות וזמינות.</p>
        </div>
        <div className={`p-4 rounded-2xl flex items-center gap-4 transition-all border-2 shadow-sm ${isOnline ? 'bg-white border-green-500' : 'bg-gray-100 border-gray-200'}`}>
          <span className={`font-bold ${isOnline ? 'text-green-700' : 'text-gray-500'}`}>{isOnline ? 'המועדון פתוח' : 'המועדון סגור'}</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-900 w-80">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-blue-900 p-3 rounded-xl text-white shadow-sm"><Wallet className="w-6 h-6" /></div>
        </div>
        <p className="text-blue-900 text-sm font-bold mb-1">היתרה שלך למושך</p>
        <h3 className="text-4xl font-black text-gray-900 mb-4">₪3,450</h3>
        <button className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2"><ArrowDownCircle className="w-5 h-5"/> משוך לחשבון</button>
      </div>
    </div>
  );
};

const ClientCheckout = ({ expertId, onCancel, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => onSuccess(`sess_${Date.now()}`), 1500);
  };
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative" dir="rtl">
      <button onClick={onCancel} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">חזור</button>
      <div className="bg-blue-50 pt-10 pb-6 px-6 text-center border-b border-gray-100">
        <Lock className="w-8 h-8 text-teal-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold text-blue-900 mb-1">הפקדה מאובטחת</h2>
        <p className="text-sm text-gray-500 font-medium">הסכום יישמר בנאמנות (Escrow).</p>
      </div>
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm flex items-center justify-between">
          <div className="font-bold text-gray-800">סכום כניסה:</div>
          <div className="font-black text-2xl text-blue-900">₪500</div>
        </div>
        <button onClick={handlePayment} disabled={isProcessing} className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all flex justify-center items-center gap-2 ${isProcessing ? 'bg-teal-400' : 'bg-teal-500 hover:bg-teal-600'}`}>
          {isProcessing ? 'משריין סכום...' : 'אשר הפקדה והיכנס'}
        </button>
      </div>
    </div>
  );
};

const AdminPanel = () => (
  <div className="p-8 max-w-6xl mx-auto min-h-screen" dir="rtl">
    <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2"><ShieldCheck className="text-red-500 w-8 h-8"/> מערכת פיקוח על (God Mode)</h2>
    <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-200">
       <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
       <p className="text-gray-500 font-bold">פאנל ניהול התראות AI וסריקות ביומטריות.</p>
    </div>
  </div>
);

// ==========================================
// 3. הווידג'טים של החדר החכם
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
      if (!canvasRef.current || !wrapperRef.current) return;
      const canvas = canvasRef.current;
      const rect = wrapperRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 400; 
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `400px`;
      const context = canvas.getContext('2d');
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
    const x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden" ref={wrapperRef}>
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['#000000', '#EF4444', '#3B82F6', '#10B981'].map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pen'); }} className={`w-6 h-6 rounded-full border-2 ${color === c && tool === 'pen' ? 'border-gray-800' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
          <button onClick={() => setTool('eraser')} className={`p-1.5 rounded-md ${tool === 'eraser' ? 'bg-gray-200 text-gray-800' : 'text-gray-600'}`}><Eraser className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 relative cursor-crosshair touch-none bg-white">
        <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} onMouseLeave={finishDrawing} onTouchStart={startDrawing} onTouchEnd={finishDrawing} onTouchMove={draw} className="w-full h-full" />
      </div>
    </div>
  );
};

const PokerWidget = ({ isHost }) => {
  const [godMode, setGodMode] = useState(false);
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
        <div className="flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500" /><span className="font-bold text-amber-500 text-sm">PLO5 - High Stakes</span></div>
        {isHost && (
          <button onClick={() => setGodMode(!godMode)} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${godMode ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
            {godMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} God Mode
          </button>
        )}
      </div>
      <div className="flex-1 bg-green-900 relative p-4 flex flex-col justify-between" style={{ backgroundImage: "radial-gradient(circle, #065f46 0%, #022c22 100%)" }}>
        <div className="flex flex-col items-center gap-2">
          <div className="flex -space-x-4">
            <Card isHidden={true} value="A" suit="♥️" color="text-red-600" /><Card isHidden={true} value="K" suit="♣️" color="text-black" /><Card isHidden={true} value="Q" suit="♦️" color="text-red-600" /><Card isHidden={true} value="J" suit="♠️" color="text-black" /><Card isHidden={true} value="10" suit="♥️" color="text-red-600" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 my-4">
          <div className="bg-black/50 border border-amber-500/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md">
            <Coins className="w-4 h-4 text-amber-400" /><span className="font-black text-amber-400 tracking-wider">₪1,550</span>
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
        <button className="bg-red-950/50 text-red-500 text-sm font-bold py-3 rounded-lg border border-red-900/50">Fold</button>
        <button className="bg-slate-800 text-slate-300 text-sm font-bold py-3 rounded-lg border border-slate-700">Check</button>
        <button className="bg-gradient-to-t from-amber-600 to-amber-400 text-slate-950 text-sm font-black py-3 rounded-lg">Pot</button>
      </div>
    </div>
  );
};

// ==========================================
// 4. חדר הוידאו החכם (מזהה קטגוריות)
// ==========================================
const VideoRoom = ({ sessionId, onLeave, isProvider = true, category = 'gaming' }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState(category === 'gaming' ? 'poker' : 'chat'); 
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  const [participants, setParticipants] = useState([
    { id: 'me', name: 'אני', isLocal: true, img: null },
    { id: 'p1', name: 'משתתף נוסף', isLocal: false, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&w=1000&q=80' }
  ]);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) { console.error("שגיאת מצלמה:", err); }
    };
    initCamera();
    return () => { if (localStream) localStream.getTracks().forEach(track => track.stop()); };
  }, []);

  const renderVideoLayout = () => {
    if (participants.length <= 2) {
      const p = participants.find(p => !p.isLocal) || participants[0];
      return (
        <>
          <img src={p.img} alt="Remote" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute bottom-24 left-6 w-48 h-32 bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700 z-20 shadow-2xl">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraEnabled ? '' : 'hidden'}`} />
            {!cameraEnabled && <div className="w-full h-full flex items-center justify-center bg-gray-900"><VideoOff className="w-6 h-6 text-gray-500" /></div>}
          </div>
        </>
      );
    }
    return (
      <div className="absolute inset-0 p-6 pt-20 grid gap-4 grid-cols-2 lg:grid-cols-3">
        {participants.map((p) => (
          <div key={p.id} className="bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 shadow-lg">
            {p.isLocal ? <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraEnabled ? '' : 'hidden'}`} /> : <img src={p.img} alt={p.name} className="w-full h-full object-cover" />}
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm font-medium">{p.name}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto my-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl h-[85vh] flex relative border border-gray-800" dir="rtl">
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 border border-gray-700">
            <Clock className="w-4 h-4 text-teal-400" /> 44:59
          </div>
        </div>
        <div className="absolute top-4 right-4 z-30 flex gap-2">
           <button onClick={() => setParticipants(prev => [...prev, { id: `p${prev.length}`, name: `שחקן ${prev.length}`, isLocal: false, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=1000&q=80' }])} className="bg-blue-600/80 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm border border-blue-400 flex items-center gap-1 transition-colors">
             <UserPlus className="w-4 h-4" /> הדגם כניסת משתתף
           </button>
        </div>

        {renderVideoLayout()}

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-md px-8 py-3 rounded-full flex gap-4 z-30 border border-gray-700 shadow-2xl">
          <button onClick={() => setMicEnabled(!micEnabled)} className={`p-4 rounded-full transition-colors ${micEnabled ? 'bg-gray-700 text-white' : 'bg-red-500/20 text-red-500'}`}>{micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}</button>
          <button onClick={() => setCameraEnabled(!cameraEnabled)} className={`p-4 rounded-full transition-colors ${cameraEnabled ? 'bg-gray-700 text-white' : 'bg-red-500/20 text-red-500'}`}>{cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}</button>
          <div className="w-px h-8 bg-gray-700 mx-2 self-center"></div>
          <button onClick={onLeave} className="p-4 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold px-6 flex items-center gap-2 shadow-lg"><PhoneCall className="w-5 h-5 transform rotate-[135deg]" /> עזוב</button>
        </div>
      </div>

      <div className="w-96 bg-gray-50 flex flex-col z-20 border-l border-gray-200">
        <div className="flex flex-wrap bg-white border-b border-gray-200 p-1">
          <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'chat' ? 'bg-teal-50 text-teal-700' : 'text-gray-500'}`}><MessageSquare className="w-4 h-4" /> צ'אט</button>
          {(category === 'therapy' || category === 'business') && (
            <>
              <button onClick={() => setActiveTab('whiteboard')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'whiteboard' ? 'bg-teal-50 text-teal-700' : 'text-gray-500'}`}><PenTool className="w-4 h-4" /> לוח</button>
              {isProvider && <button onClick={() => setActiveTab('notes')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'notes' ? 'bg-teal-50 text-teal-700' : 'text-gray-500'}`}><ShieldCheck className="w-4 h-4" /> הערות</button>}
            </>
          )}
          {category === 'gaming' && (
            <>
              <button onClick={() => setActiveTab('poker')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'poker' ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm' : 'text-gray-500'}`}><span className="text-lg leading-none">♠️</span> פוקר</button>
              <button onClick={() => setActiveTab('rummikub')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'rummikub' ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' : 'text-gray-500'}`}><Dices className="w-4 h-4" /> רמיקוב</button>
              <button onClick={() => setActiveTab('chess')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'chess' ? 'bg-gray-200 text-gray-800 border border-gray-300 shadow-sm' : 'text-gray-500'}`}><Gamepad2 className="w-4 h-4" /> שחמט</button>
            </>
          )}
        </div>
        <div className="flex-1 overflow-hidden p-3 bg-gray-50 flex flex-col">
          {activeTab === 'chat' && <div className="text-center text-gray-400 mt-10">הצ'אט מוצפן מקצה לקצה.</div>}
          {activeTab === 'whiteboard' && <div className="h-full w-full"><WhiteboardWidget /></div>}
          {activeTab === 'poker' && <div className="h-full w-full p-2 bg-slate-950 rounded-xl overflow-hidden"><PokerWidget isHost={isProvider} /></div>}
          {(activeTab === 'rummikub' || activeTab === 'chess') && (
            <div className="h-full w-full p-6 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300">
               <Gamepad2 className="w-16 h-16 text-gray-300 mb-4" />
               <h3 className="font-bold text-gray-700 text-lg mb-2">מנוע המשחק בבנייה</h3>
               <p className="text-sm text-gray-500">הלוח האינטראקטיבי יפותח בשלב הבא.</p>
            </div>
          )}
          {activeTab === 'notes' && <textarea className="h-full w-full p-4 rounded-xl border border-gray-200 bg-white" placeholder="הערות..."></textarea>}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. הנתב המרכזי (Router)
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('welcome'); 
  const [roomCategory, setRoomCategory] = useState('gaming'); 

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-gray-900 text-gray-300 text-xs py-2 px-4 flex flex-wrap gap-4 items-center justify-center border-b-4 border-red-500" dir="rtl">
        <span className="font-bold text-white flex items-center gap-1"><LayoutDashboard className="w-4 h-4 text-red-500"/> תפריט פיתוח:</span>
        <button onClick={() => setCurrentView('welcome')} className="hover:text-white transition-colors">מסך פתיחה</button><span>|</span>
        <button onClick={() => setCurrentView('marketplace')} className="hover:text-white transition-colors">קטלוג</button><span>|</span>
        <button onClick={() => setCurrentView('checkout')} className="hover:text-white transition-colors">קופה</button><span>|</span>
        <button onClick={() => { setRoomCategory('therapy'); setCurrentView('videoRoom'); }} className="text-teal-400 font-bold hover:text-teal-300 transition-colors">חדר ייעוץ</button><span>|</span>
        <button onClick={() => { setRoomCategory('gaming'); setCurrentView('videoRoom'); }} className="text-amber-400 font-bold hover:text-amber-300 transition-colors">חדר משחקים</button><span>|</span>
        <button onClick={() => setCurrentView('onboarding')} className="hover:text-white transition-colors">הרשמת מטפל</button><span>|</span>
        <button onClick={() => setCurrentView('dashboard')} className="hover:text-white transition-colors">דאשבורד</button><span>|</span>
        <button onClick={() => setCurrentView('admin')} className="text-red-400 font-bold hover:text-red-300 transition-colors">ניהול</button>
      </div>
      
      {currentView !== 'welcome' && currentView !== 'videoRoom' && currentView !== 'admin' && (
        <nav className="bg-blue-900 text-white px-6 py-3 flex justify-between items-center sticky top-0 z-50" dir="rtl">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('welcome')}>
            <ShieldCheck className="w-8 h-8 text-teal-400" /><span className="text-xl font-bold">Veri<span className="text-teal-400">Sess</span></span>
          </div>
        </nav>
      )}

      {currentView === 'welcome' && (
        <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-900 to-gray-900" dir="rtl">
          <div className="text-center mb-12"><ShieldCheck className="w-24 h-24 text-teal-400 mx-auto mb-6" /><h1 className="text-5xl font-bold text-white mb-4">Veri<span className="text-teal-400">Sess</span></h1></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center cursor-pointer" onClick={() => setCurrentView('marketplace')}><h2 className="text-2xl font-bold text-blue-900 mb-6">מחפש שירות / משחק</h2><button className="w-full bg-teal-500 text-white font-bold py-4 rounded-xl">היכנס כלקוח</button></div>
            <div className="bg-blue-800 rounded-2xl p-8 shadow-xl text-center"><h2 className="text-2xl font-bold text-white mb-6">אני מומחה / מנהל קלאב</h2><button onClick={() => setCurrentView('dashboard')} className="w-full bg-blue-900 text-white border border-blue-600 font-bold py-4 rounded-xl">כניסת מנהלים</button></div>
          </div>
        </div>
      )}

      {currentView === 'marketplace' && <Marketplace onSelectExpert={(id, cat) => { setRoomCategory(cat); setCurrentView('checkout'); }} />}
      {currentView === 'onboarding' && <ProviderOnboarding />}
      {currentView === 'dashboard' && <ProviderDashboard />}
      {currentView === 'admin' && <AdminPanel />}
      {currentView === 'checkout' && <div className="p-8"><ClientCheckout onCancel={() => setCurrentView('marketplace')} onSuccess={() => setCurrentView('videoRoom')} /></div>}
      {currentView === 'videoRoom' && <VideoRoom onLeave={() => setCurrentView('welcome')} category={roomCategory} />}
    </div>
  );
}
