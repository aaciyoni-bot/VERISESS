import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { 
  ShieldCheck, Video, VideoOff, Mic, MicOff, Clock, 
  PhoneCall, MessageSquare, PenTool, AlertTriangle, Send, 
  Users, UserPlus, Gamepad2, Dices, GraduationCap, X,
  Coins, Eye, EyeOff, Crown, HandCoins, DollarSign, Eraser, Trash2
} from 'lucide-react';

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
// 1. ווידג'ט לוח לבן פנימי
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

// ==========================================
// 2. מנוע פוקר פנימי (כולל Rake וכסף מדומה)
// ==========================================
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
        <button className="bg-red-950/50 text-red-500 text-sm font-bold py-3 rounded-lg border border-red-900/50 hover:bg-red-900/80 transition-colors">Fold</button>
        <button className="bg-slate-800 text-slate-300 text-sm font-bold py-3 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors">Check</button>
        <button onClick={() => setPot(p => p + 200)} className={`text-slate-950 text-sm font-black py-3 rounded-lg shadow-lg ${mode === 'real' ? 'bg-gradient-to-t from-amber-600 to-amber-400 hover:from-amber-500' : 'bg-gradient-to-t from-blue-500 to-blue-300 hover:from-blue-400'}`}>Bet (200)</button>
      </div>
    </div>
  );
};

// ==========================================
// 3. קומפוננטת שכבת הציור השקופה (Draw Overlay - מיועד לחוגים)
// ==========================================
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
    ctx.strokeStyle = '#ef4444'; // עט אדום להדגשות של המורה
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
  return (
    <canvas 
      ref={canvasRef} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
      className="absolute inset-0 z-50 cursor-crosshair touch-none"
    />
  );
};

// ==========================================
// 4. חדר הוידאו החכם (מזהה קטגוריות)
// ==========================================
export default function VideoRoom({ sessionId, onLeave, isProvider = true, category = 'gaming' }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // בחירת טאב התחלתי לפי סוג החדר
  const [activeTab, setActiveTab] = useState(category === 'therapy' ? 'chat' : 'poker'); 
  const [isOverlayActive, setIsOverlayActive] = useState(false);

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const currentUser = auth?.currentUser;

  const [participants, setParticipants] = useState([
    { id: 'me', name: 'אני', isLocal: true, img: null },
    { id: 'p1', name: 'משתתף נוסף', isLocal: false, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&w=1000&q=80' }
  ]);

  // לחצן פיתוח שמדמה כניסה של שחקן נוסף (מחליף ל-Grid)
  const addTestParticipant = () => {
    setParticipants(prev => [...prev, { id: `p${prev.length}`, name: `שחקן ${prev.length}`, isLocal: false, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=1000&q=80' }]);
  };

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

  // סנכרון צ'אט
  useEffect(() => {
    if (!sessionId || !db) return;
    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
    const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(data.messages || []);
        if (data.status === 'ended' && onLeave) {
           alert("השיחה הסתיימה.");
           onLeave();
        }
      }
    });
    return () => unsubscribe();
  }, [sessionId, onLeave]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionId || !currentUser) return;
    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
    try {
      await updateDoc(sessionRef, { messages: arrayUnion({ senderId: currentUser.uid, text: newMessage, timestamp: new Date().toISOString() }) });
      setNewMessage('');
    } catch (error) { console.error("Error sending message:", error); }
  };

  const toggleMedia = (type) => {
    if (localStream) {
      const tracks = type === 'video' ? localStream.getVideoTracks() : localStream.getAudioTracks();
      tracks.forEach(track => { track.enabled = !track.enabled; });
      if (type === 'video') setCameraEnabled(!cameraEnabled);
      if (type === 'audio') setMicEnabled(!micEnabled);
    }
  };

  const handleEndCall = async () => {
    if (sessionId && db) {
      const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
      try { await updateDoc(sessionRef, { status: 'ended' }); } catch (error) { console.error(error); }
    }
    if (onLeave) onLeave();
  };

  // מנוע התצוגה (1-על-1 לעומת גריד קבוצתי)
  const renderVideoLayout = () => {
    if (participants.length <= 2) {
      const p = participants.find(p => !p.isLocal) || participants[0];
      return (
        <>
          <img src={p.img} alt="Remote" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute bottom-24 left-6 w-48 h-32 bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700 z-20 shadow-2xl hover:scale-105 transition-transform">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraEnabled ? '' : 'hidden'}`} />
            {!cameraEnabled && <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900"><VideoOff className="w-6 h-6 text-gray-500 mb-1" /></div>}
          </div>
        </>
      );
    }
    return (
      <div className="absolute inset-0 p-6 pt-20 grid gap-4 grid-cols-2 lg:grid-cols-3">
        {participants.map((p) => (
          <div key={p.id} className="bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 shadow-lg">
            {p.isLocal ? <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraEnabled ? '' : 'hidden'}`} /> : <img src={p.img} alt={p.name} className="w-full h-full object-cover" />}
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm font-medium">{p.name} {p.isLocal && '(אתה)'}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto my-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl h-[85vh] flex relative border border-gray-800" dir="rtl">
      
      {/* אזור הוידאו השמאלי */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 border border-gray-700">
            <Clock className="w-4 h-4 text-teal-400" /> 44:59
          </div>
          {category === 'class' && (
            <div className="bg-blue-600/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 border border-blue-500 font-bold">
              <GraduationCap className="w-4 h-4" /> מצב חוג (מורה שולט)
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 z-30 flex gap-2">
           <button onClick={addTestParticipant} className="bg-gray-800/80 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm border border-gray-600 flex items-center gap-1 transition-colors">
             <UserPlus className="w-4 h-4" /> הכנס משתתף נוסף (טסט)
           </button>
        </div>

        {renderVideoLayout()}

        {/* סרגל כלים תחתון */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-md px-8 py-3 rounded-full flex gap-4 z-30 border border-gray-700 shadow-2xl">
          <button onClick={() => toggleMedia('audio')} className={`p-4 rounded-full transition-colors ${micEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500'}`}><Mic className="w-5 h-5" /></button>
          <button onClick={() => toggleMedia('video')} className={`p-4 rounded-full transition-colors ${cameraEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500'}`}><Video className="w-5 h-5" /></button>
          <div className="w-px h-8 bg-gray-700 mx-2 self-center"></div>
          <button onClick={handleEndCall} className="p-4 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold px-6 flex items-center gap-2 shadow-lg"><PhoneCall className="w-5 h-5 transform rotate-[135deg]" /> עזוב חדר</button>
        </div>
      </div>

      {/* פאנל ווידג'טים ימני */}
      <div className="w-[450px] bg-gray-50 flex flex-col z-20 border-l border-gray-200">
        
        {/* שורת טאבים */}
        <div className="flex flex-wrap bg-white border-b border-gray-200 p-1">
          <button onClick={() => {setActiveTab('chat'); setIsOverlayActive(false);}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'chat' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}><MessageSquare className="w-4 h-4" /> צ'אט</button>
          
          {(category === 'therapy' || category === 'class' || category === 'business') && (
            <button onClick={() => {setActiveTab('whiteboard'); setIsOverlayActive(false);}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'whiteboard' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}><PenTool className="w-4 h-4" /> לוח</button>
          )}

          {(category === 'gaming' || category === 'class') && (
            <>
              <button onClick={() => {setActiveTab('poker'); setIsOverlayActive(false);}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'poker' ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><span className="text-lg leading-none">♠️</span> פוקר</button>
              <button onClick={() => {setActiveTab('rummikub'); setIsOverlayActive(false);}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'rummikub' ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><Dices className="w-4 h-4" /> רמיקוב</button>
              <button onClick={() => {setActiveTab('chess'); setIsOverlayActive(false);}} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'chess' ? 'bg-gray-200 text-gray-800 border border-gray-300 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><Gamepad2 className="w-4 h-4" /> שחמט</button>
            </>
          )}
        </div>

        {/* תוכן הטאב */}
        <div className="flex-1 overflow-hidden p-3 bg-gray-50 flex flex-col relative">
          
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                 <div className="text-center text-gray-400 text-sm mt-10">הצ'אט מוצפן מקצה לקצה.</div>
              </div>
              <form onSubmit={sendMessage} className="flex gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="הקלד הודעה..." className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none" />
                <button type="submit" className="bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600"><Send className="w-4 h-4" /></button>
              </form>
            </div>
          )}

          {activeTab === 'whiteboard' && <div className="h-full w-full"><WhiteboardWidget /></div>}
          
          {activeTab === 'poker' && (
            <div className="h-full w-full p-2 bg-slate-950 rounded-xl relative">
              {category === 'class' && (
                <div className="absolute top-2 right-2 z-50 flex gap-2">
                  <button 
                    onClick={() => setIsOverlayActive(!isOverlayActive)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${isOverlayActive ? 'bg-red-500 text-white shadow-lg border border-red-400' : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}
                  >
                    <PenTool className="w-3 h-3" /> {isOverlayActive ? 'משרטט כעת...' : 'צייר על השולחן'}
                  </button>
                  {isOverlayActive && (
                    <button onClick={() => setIsOverlayActive(false)} className="bg-gray-800 text-white p-1.5 rounded-lg border border-gray-700"><X className="w-4 h-4" /></button>
                  )}
                </div>
              )}
              {/* הפעלת מנוע הפוקר המוטמע שלנו */}
              <PokerWidget isHost={isProvider} mode={category === 'class' ? 'play' : 'real'} />
              {/* שכבת הציור של המורה יושבת מעליו שקופה */}
              <DrawOverlay isActive={isOverlayActive} />
            </div>
          )}

          {(activeTab === 'rummikub' || activeTab === 'chess') && (
            <div className="h-full w-full p-6 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300">
               <Gamepad2 className="w-16 h-16 text-gray-300 mb-4" />
               <h3 className="font-bold text-gray-700 text-lg mb-2">מנוע {activeTab === 'chess' ? 'השחמט' : 'הרמיקוב'} בבנייה</h3>
               <p className="text-sm text-gray-500">הלוח האינטראקטיבי יפותח בהמשך.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
