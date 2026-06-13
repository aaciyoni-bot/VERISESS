import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { 
  ShieldCheck, LogOut, LayoutDashboard, Video, VideoOff, Mic, MicOff, 
  Clock, PhoneCall, MessageSquare, PenTool, AlertTriangle, Send, 
  Users, UserPlus, Crown, Gamepad2, Dices, Eraser, Trash2, Coins, 
  Eye, EyeOff, CheckCircle, Wallet, DollarSign, ArrowDownCircle, Lock, Activity,
  GraduationCap, HandCoins, X, CheckCircle2, ChevronRight, Search, FileText, Check,
  Bell, Upload, Camera, CreditCard
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
// 2. ווידג'טים ומשחקים 
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
            <button onClick={() => alert("חולקו צ'יפים")} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
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
        <button className="bg-red-950/50 text-red-500 text-sm font-bold py-3 rounded-lg border border-red-900/50">Fold</button>
        <button className="bg-slate-800 text-slate-300 text-sm font-bold py-3 rounded-lg border border-slate-700">Check</button>
        <button onClick={() => setPot(p => p + 200)} className={`text-slate-950 text-sm font-black py-3 rounded-lg shadow-lg ${mode === 'real' ? 'bg-gradient-to-t from-amber-600 to-amber-400' : 'bg-gradient-to-t from-blue-500 to-blue-300'}`}>Bet (200)</button>
      </div>
    </div>
  );
};

const DrawOverlay = ({ isActive }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const contextRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ef4444'; 
    ctx.lineWidth = 4;
    contextRef.current = ctx;
  }, [isActive]);

  const startDrawing = (e) => {
    if (!isActive) return;
    const rect = canvasRef.current.getBoundingClientRect();
    contextRef.current.beginPath();
    contextRef.current.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };
  const draw = (e) => {
    if (!isDrawing || !isActive) return;
    const rect = canvasRef.current.getBoundingClientRect();
    contextRef.current.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    contextRef.current.stroke();
  };
  const stopDrawing = () => setIsDrawing(false);

  if (!isActive) return null;
  return <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} className="absolute inset-0 z-50 cursor-crosshair touch-none" />;
};

const VideoRoom = ({ sessionId, onLeave, isProvider = true, category = 'gaming' }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState(category === 'therapy' ? 'chat' : 'poker'); 
  const [isOverlayActive, setIsOverlayActive] = useState(false);
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
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 border border-gray-700"><Clock className="w-4 h-4 text-teal-400" /> 44:59</div>
          {category === 'class' && <div className="bg-blue-600/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 border border-blue-500 font-bold"><GraduationCap className="w-4 h-4" /> מצב חוג</div>}
        </div>
        <div className="absolute top-4 right-4 z-30 flex gap-2">
           <button onClick={() => setParticipants(prev => [...prev, { id: `p${prev.length}`, name: `שחקן ${prev.length}`, isLocal: false, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=1000&q=80' }])} className="bg-gray-800/80 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-600 flex items-center gap-1"><UserPlus className="w-4 h-4" /> שחקן נוסף</button>
        </div>
        {renderVideoLayout()}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-md px-8 py-3 rounded-full flex gap-4 z-30 border border-gray-700 shadow-2xl">
          <button onClick={() => setMicEnabled(!micEnabled)} className={`p-4 rounded-full ${micEnabled ? 'bg-gray-700 text-white' : 'bg-red-500/20 text-red-500'}`}>{micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}</button>
          <button onClick={() => setCameraEnabled(!cameraEnabled)} className={`p-4 rounded-full ${cameraEnabled ? 'bg-gray-700 text-white' : 'bg-red-500/20 text-red-500'}`}>{cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}</button>
          <div className="w-px h-8 bg-gray-700 mx-2 self-center"></div>
          <button onClick={onLeave} className="p-4 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold px-6 flex items-center gap-2 shadow-lg"><PhoneCall className="w-5 h-5 transform rotate-[135deg]" /> עזוב</button>
        </div>
      </div>

      <div className="w-[450px] bg-gray-50 flex flex-col z-20 border-l border-gray-200">
        <div className="flex flex-wrap bg-white border-b border-gray-200 p-1">
          <button onClick={() => {setActiveTab('chat'); setIsOverlayActive(false);}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'chat' ? 'bg-teal-50 text-teal-700' : 'text-gray-500'}`}><MessageSquare className="w-4 h-4" /> צ'אט</button>
          {(category === 'therapy' || category === 'class' || category === 'business') && (
            <button onClick={() => {setActiveTab('whiteboard'); setIsOverlayActive(false);}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'whiteboard' ? 'bg-teal-50 text-teal-700' : 'text-gray-500'}`}><PenTool className="w-4 h-4" /> לוח</button>
          )}
          {(category === 'gaming' || category === 'class') && (
            <>
              <button onClick={() => {setActiveTab('poker'); setIsOverlayActive(false);}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'poker' ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm' : 'text-gray-500'}`}><span className="text-lg leading-none">♠️</span> פוקר</button>
              <button onClick={() => {setActiveTab('rummikub'); setIsOverlayActive(false);}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'rummikub' ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' : 'text-gray-500'}`}><Dices className="w-4 h-4" /> רמיקוב</button>
            </>
          )}
        </div>

        <div className="flex-1 overflow-hidden p-3 bg-gray-50 flex flex-col relative">
          {activeTab === 'chat' && <div className="text-center text-gray-400 mt-10">הצ'אט מוצפן מקצה לקצה.</div>}
          {activeTab === 'whiteboard' && <div className="h-full w-full"><WhiteboardWidget /></div>}
          {activeTab === 'poker' && (
            <div className="h-full w-full p-2 bg-slate-950 rounded-xl relative">
              {category === 'class' && (
                <div className="absolute top-2 right-2 z-50 flex gap-2">
                  <button onClick={() => setIsOverlayActive(!isOverlayActive)} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${isOverlayActive ? 'bg-red-500 text-white shadow-lg border border-red-400' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}><PenTool className="w-3 h-3" /> {isOverlayActive ? 'משרטט כעת...' : 'צייר על השולחן'}</button>
                  {isOverlayActive && <button onClick={() => setIsOverlayActive(false)} className="bg-gray-800 text-white p-1.5 rounded-lg border border-gray-700"><X className="w-4 h-4" /></button>}
                </div>
              )}
              <PokerWidget isHost={isProvider} mode={category === 'class' ? 'play' : 'real'} />
              <DrawOverlay isActive={isOverlayActive} />
            </div>
          )}
          {activeTab === 'rummikub' && (
            <div className="h-full w-full p-6 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300">
               <Gamepad2 className="w-16 h-16 text-gray-300 mb-4" /><h3 className="font-bold text-gray-700 text-lg mb-2">מנוע הרמיקוב בבנייה</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. הנתב המרכזי והמסכים הפשוטים
// ==========================================

const Marketplace = ({ onSelectExpert }) => (
  <div className="p-8 max-w-6xl mx-auto min-h-screen" dir="rtl">
    <h2 className="text-3xl font-bold text-blue-900 mb-6 flex items-center gap-2"><ShieldCheck className="w-8 h-8 text-teal-500" />קטלוג שירותים (Live)</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-3xl mb-4 shadow-sm">{i === 1 ? 'ד' : i === 2 ? 'ע' : 'פ'}</div>
          <h3 className="text-xl font-bold text-gray-800">{i === 1 ? 'ד"ר יעל שרת' : i === 2 ? 'עו"ד דניאל כהן' : 'שולחן פוקר קבוצתי'}</h3>
          <p className="text-gray-500 text-sm mb-2">{i === 1 ? 'פסיכולוגיה קלינית' : i === 2 ? 'דיני משפחה' : 'חדר חברתי (PLO5)'}</p>
          <button onClick={() => onSelectExpert(`expert_${i}`, i === 3 ? 'gaming' : 'therapy')} className="mt-auto w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-xl shadow-md">{i === 3 ? 'הצטרף לשולחן (₪500)' : `התייעץ עכשיו (₪${150 + (i * 50)})`}</button>
        </div>
      ))}
    </div>
  </div>
);

const ClientCheckout = ({ expertId, onCancel, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const handlePayment = () => { setIsProcessing(true); setTimeout(() => onSuccess(`sess_${Date.now()}`), 1500); };
  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative" dir="rtl">
      <button onClick={onCancel} className="absolute right-4 top-4 text-gray-400 z-10">חזור</button>
      <div className="bg-blue-50 pt-10 pb-6 px-6 text-center border-b border-gray-100"><Lock className="w-8 h-8 text-teal-500 mx-auto mb-2" /><h2 className="text-2xl font-bold text-blue-900 mb-1">הפקדה מאובטחת</h2></div>
      <div className="p-6">
        <button onClick={handlePayment} disabled={isProcessing} className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg flex justify-center items-center gap-2 ${isProcessing ? 'bg-teal-400' : 'bg-teal-500'}`}>{isProcessing ? 'משריין סכום...' : 'אשר הפקדה והיכנס'}</button>
      </div>
    </div>
  );
};

const AdminPanel = () => {
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

const ProviderOnboarding = () => {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  useEffect(() => {
    signInAnonymously(auth);
    const unsub = onAuthStateChanged(auth, (usr) => setUser(usr));
    return unsub;
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSimulatedUpload = (field) => {
    setFormData(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmitToFirebase = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // כאן אנו מבצעים כתיבה, מכיוון שאיננו צריכים באמת לשמור על הקובץ, אנחנו רק מעבירים סטטוס. 
      setStep(5); 
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("אירעה שגיאה בשמירת הנתונים.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

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

          {step === 2 && (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-8 h-8 text-blue-900" />
                <h2 className="text-2xl font-bold text-gray-800">אימות זהות מחמיר (KYC)</h2>
              </div>
              <p className="text-gray-500 mb-8">כדי לשמור על סביבה בטוחה, אנו מאמתים כל מומחה. המסמכים מוצפנים ונמחקים לאחר האימות.</p>
              
              <div className="space-y-6">
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
                המשך לשלב הבא 
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const ProviderDashboard = () => {
  const [user, setUser] = useState(null);
  const [providerData, setProviderData] = useState({ displayName: 'דוד כהן', category: 'עורך דין פלילי' , rating: '5.0', rate: 250});
  const [isOnline, setIsOnline] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [availableBalance, setAvailableBalance] = useState(3450.00); 
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus); 
  };

  const handleWithdrawal = () => {
    if (availableBalance <= 0) return;
    setIsWithdrawing(true);
    
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawalSuccess(true);
      setAvailableBalance(0); 
      
      setTimeout(() => setWithdrawalSuccess(false), 5000);
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-12" dir="rtl">
      
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-900" />
            <span className="font-bold text-xl text-blue-900">Veri<span className="text-teal-500">Sess</span></span>
            <span className="ml-2 bg-blue-50 text-blue-800 text-xs font-bold px-2 py-1 rounded-md hidden sm:inline-block">Provider Area</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700 relative">
              <Bell className="w-6 h-6" />
              {activeSessions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {activeSessions.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
              <div className="text-left hidden sm:block">
                <div className="text-sm font-bold text-gray-800">{providerData.displayName}</div>
                <div className="text-xs text-gray-500">{providerData.category}</div>
              </div>
              <div className="w-10 h-10 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {providerData.displayName ? providerData.displayName.charAt(0) : 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        
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
              <span className="text-xs text-gray-500">
                {isOnline ? 'לקוחות רואים אותך במערכת' : 'הדלק כדי לקבל עבודה'}
              </span>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={toggleOnlineStatus} />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
        </div>

        {activeSessions.length > 0 && (
          <div className="mb-8 bg-red-50 border-2 border-red-500 rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-500 text-white p-2 rounded-full animate-pulse">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-red-700">קריאת SOS ממתינה לך!</h2>
            </div>
            <div className="space-y-3">
              {activeSessions.map(session => (
                <div key={session.id} className="bg-white rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center shadow-sm border border-red-100">
                  <div className="mb-4 sm:mb-0 text-center sm:text-right">
                    <div className="font-bold text-gray-800">לקוח ממתין בחדר הטיפול</div>
                    <div className="text-sm text-gray-500">הכנסה צפויה: ₪{(providerData.rate * 0.8).toFixed(2)} (לאחר עמלה)</div>
                  </div>
                  <button className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md">
                    <Video className="w-5 h-5" /> היכנס לחדר עכשיו
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-blue-900 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -left-6 -top-6 opacity-5 pointer-events-none">
              <Wallet className="w-32 h-32 text-blue-900" />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="bg-blue-900 p-3 rounded-xl text-white shadow-sm">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-md border border-green-200">
                זמין למשיכה מיידית
              </span>
            </div>
            
            <div className="relative z-10 mb-4">
              <p className="text-blue-900 text-sm font-bold mb-1">היתרה שלך (נטו)</p>
              <h3 className="text-4xl font-black text-gray-900">₪{availableBalance.toLocaleString('he-IL', {minimumFractionDigits: 2})}</h3>
            </div>

            {withdrawalSuccess ? (
              <div className="bg-green-50 border border-green-200 text-green-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 animate-in zoom-in">
                <CheckCircle className="w-5 h-5" /> הכסף בדרך לבנק!
              </div>
            ) : (
              <button 
                onClick={handleWithdrawal}
                disabled={isWithdrawing || availableBalance === 0}
                className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm
                  ${availableBalance === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : isWithdrawing 
                      ? 'bg-blue-100 text-blue-900 cursor-wait' 
                      : 'bg-blue-900 hover:bg-blue-800 text-white active:scale-95'}`}
              >
                {isWithdrawing ? (
                  <span className="flex items-center gap-2">מעבד העברה<span className="animate-pulse">...</span></span>
                ) : (
                  <>
                    <ArrowDownCircle className="w-5 h-5" /> {availableBalance === 0 ? 'אין יתרה למשיכה' : 'משוך לחשבון הבנק'}
                  </>
                )}
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">שעות סשנים החודש</p>
              <h3 className="text-3xl font-bold text-gray-900">12.5 <span className="text-lg text-gray-400 font-normal">שעות</span></h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
                <Activity className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                <CheckCircle2 className="w-3 h-3" /> מעולה
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">ציון אמינות מטפל</p>
              <h3 className="text-3xl font-bold text-gray-900">{providerData.rating || '5.0'} <span className="text-lg text-gray-400 font-normal">/ 5</span></h3>
            </div>
          </div>

        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800 text-lg">פגישות קרובות מתוזמנות</h3>
            <button className="text-teal-600 text-sm font-bold hover:underline">סנכרן יומן Google</button>
          </div>
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">אין פגישות מתוזמנות לימים הקרובים.</p>
            <p className="text-sm text-gray-400 mt-1">הדלק את כפתור ה-SOS כדי לקבל לקוחות מיידיים.</p>
          </div>
        </div>

      </main>
    </div>
  );
}

// ==========================================
// 6. הנתב המרכזי
// ==========================================
export default function App() {
  const [currentView, setCurrentView] = useState('welcome'); 
  const [testSessionId, setTestSessionId] = useState('sess_demo_123');
  const [roomCategory, setRoomCategory] = useState('gaming'); 

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-gray-900 text-gray-300 text-xs py-2 px-4 flex flex-wrap gap-4 items-center justify-center border-b-4 border-red-500" dir="rtl">
        <span className="font-bold text-white flex items-center gap-1"><LayoutDashboard className="w-4 h-4 text-red-500"/> תפריט פיתוח:</span>
        <button onClick={() => setCurrentView('welcome')} className="hover:text-white transition-colors">מסך פתיחה</button><span>|</span>
        <button onClick={() => setCurrentView('marketplace')} className="hover:text-white transition-colors">קטלוג מומחים</button><span>|</span>
        <button onClick={() => { setRoomCategory('therapy'); setCurrentView('videoRoom'); }} className="text-teal-400 font-bold hover:text-teal-300 transition-colors">ייעוץ (לוח לבן)</button><span>|</span>
        <button onClick={() => { setRoomCategory('gaming'); setCurrentView('videoRoom'); }} className="text-amber-400 font-bold hover:text-amber-300 transition-colors">חדר פוקר (Rake אמיתי)</button><span>|</span>
        <button onClick={() => { setRoomCategory('class'); setCurrentView('videoRoom'); }} className="text-blue-400 font-bold hover:text-blue-300 bg-blue-900/50 px-2 py-1 rounded">חוג (כסף מדומה + ציור)</button><span>|</span>
        <button onClick={() => setCurrentView('onboarding')} className="hover:text-white transition-colors">הצטרפות מטפל</button><span>|</span>
        <button onClick={() => setCurrentView('dashboard')} className="hover:text-white transition-colors">אזור מטפל</button><span>|</span>
        <button onClick={() => setCurrentView('admin')} className="text-red-400 font-bold hover:text-red-300 transition-colors">אדמין</button>
      </div>
      
      {currentView === 'welcome' && (
        <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-900 to-gray-900" dir="rtl">
          <div className="text-center mb-12"><ShieldCheck className="w-24 h-24 text-teal-400 mx-auto mb-6" /><h1 className="text-5xl font-bold text-white mb-4">Veri<span className="text-teal-400">Sess</span></h1></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
            <div className="bg-white rounded-2xl p-8 shadow-xl text-center cursor-pointer" onClick={() => setCurrentView('marketplace')}><h2 className="text-2xl font-bold text-blue-900 mb-6">אני מחפש שירות או ייעוץ</h2><button className="w-full bg-teal-500 text-white font-bold py-4 rounded-xl">היכנס כלקוח</button></div>
            <div className="bg-blue-800 rounded-2xl p-8 shadow-xl border border-blue-700 flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-white mb-2">אני מומחה / מטפל</h2>
              <div className="mt-auto w-full flex flex-col gap-3">
                <button onClick={() => setCurrentView('onboarding')} className="w-full bg-white hover:bg-gray-100 text-blue-900 font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                  בקשת הצטרפות
                </button>
                <button onClick={() => setCurrentView('dashboard')} className="w-full bg-blue-900 hover:bg-blue-950 text-white border border-blue-600 font-bold py-3 px-6 rounded-xl transition-colors">
                  כניסת רשומים
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'marketplace' && <Marketplace onSelectExpert={(id, cat) => { setRoomCategory(cat); setCurrentView('checkout'); }} />}
      {currentView === 'checkout' && <div className="p-8"><ClientCheckout onCancel={() => setCurrentView('marketplace')} onSuccess={(sessionId) => { setTestSessionId(sessionId); setCurrentView('videoRoom'); }} /></div>}
      {currentView === 'videoRoom' && <VideoRoom sessionId={testSessionId} onLeave={() => setCurrentView('welcome')} isProvider={true} category={roomCategory} />}
      {currentView === 'onboarding' && <ProviderOnboarding />}
      {currentView === 'dashboard' && <ProviderDashboard />}
      {currentView === 'admin' && <AdminPanel />}
    </div>
  );
}
