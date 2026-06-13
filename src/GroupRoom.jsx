import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { 
  ShieldCheck, Video, VideoOff, Mic, MicOff, Clock, 
  PhoneCall, MessageSquare, PenTool, Users, ShieldAlert,
  UserPlus, Check, X, MonitorUp, Hand, Gamepad2, Dices,
  Eraser, Trash2, Crown, DollarSign, HandCoins, Eye, EyeOff, Coins
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
// ווידג'ט לוח לבן פנימי
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
// מנוע פוקר פנימי (כולל Rake וכסף מדומה)
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

export default function GroupRoom({ sessionId, onLeave, isHost = true }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // הטאב הפעיל כעת
  const [activeTab, setActiveTab] = useState('participants'); 
  
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const currentUser = auth?.currentUser;

  const [participants, setParticipants] = useState([
    { id: 'me', name: 'אני (מנחה)', isHost: true, micOn: true, camOn: true, isLocal: true },
    { id: 'p1', name: 'ישראל ישראלי', isHost: false, micOn: false, camOn: true, isLocal: false, img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&w=300&q=80' },
  ]);
  
  const [waitingRoom, setWaitingRoom] = useState([]);

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) { console.error("שגיאה בגישה למצלמה:", err); }
    };
    initCamera();

    const timer = setTimeout(() => {
      setWaitingRoom([{ id: 'wait_1', name: 'דנה כהן (מטופלת)', role: 'client', time: '14:02' }]);
    }, 5000);

    return () => {
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!sessionId || !db) return;
    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
    const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
      if (docSnap.exists()) setMessages(docSnap.data().messages || []);
    });
    return () => unsubscribe();
  }, [sessionId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionId || !currentUser) return;
    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
    try {
      await updateDoc(sessionRef, { messages: arrayUnion({ senderId: currentUser.uid, text: newMessage, timestamp: new Date().toISOString() }) });
      setNewMessage('');
    } catch (error) { console.error("Error sending message:", error); }
  };

  const admitUser = (user) => {
    setWaitingRoom(prev => prev.filter(u => u.id !== user.id));
    setParticipants(prev => [...prev, { id: user.id, name: user.name, isHost: false, micOn: true, camOn: true, isLocal: false, img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&w=300&q=80' }]);
  };
  const denyUser = (userId) => setWaitingRoom(prev => prev.filter(u => u.id !== userId));
  const muteAll = () => setParticipants(prev => prev.map(p => p.isLocal ? p : { ...p, micOn: false }));

  const toggleMedia = (type) => {
    if (localStream) {
      const tracks = type === 'video' ? localStream.getVideoTracks() : localStream.getAudioTracks();
      tracks.forEach(track => { track.enabled = !track.enabled; });
      if (type === 'video') setCameraEnabled(!cameraEnabled);
      if (type === 'audio') setMicEnabled(!micEnabled);
    }
  };

  const getGridClass = () => {
    const count = participants.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    return "grid-cols-3 grid-rows-3"; 
  };

  return (
    <div className="max-w-7xl mx-auto my-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl h-[85vh] flex relative border border-gray-800" dir="rtl">
      
      <div className="flex-1 relative bg-black flex flex-col overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <div className="bg-gray-800/80 backdrop-blur text-white px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-700 text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-400" /> חדר קבוצתי
            </div>
            {isHost && (
              <div className="bg-teal-900/80 backdrop-blur text-teal-100 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-teal-700 text-sm">
                <ShieldAlert className="w-4 h-4" /> מנחה
              </div>
            )}
          </div>
          <div className="bg-black/60 text-white px-4 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-2 border border-gray-700 font-mono pointer-events-auto">
            <Clock className="w-4 h-4 text-gray-400" /> 44:59
          </div>
        </div>

        <div className={`flex-1 p-4 mt-12 grid gap-4 ${getGridClass()}`}>
          {participants.map((participant) => (
            <div key={participant.id} className="bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 shadow-lg group">
              {participant.isLocal ? (
                <>
                  <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraEnabled ? '' : 'hidden'}`} />
                  {!cameraEnabled && <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-3xl font-bold text-gray-500">א</div>}
                </>
              ) : (
                <>
                  <img src={participant.img} alt={participant.name} className={`w-full h-full object-cover ${participant.camOn ? '' : 'hidden'}`} />
                  {!participant.camOn && <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-3xl font-bold text-gray-500">{participant.name.charAt(0)}</div>}
                </>
              )}

              <div className="absolute bottom-3 right-3 left-3 flex justify-between items-end">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm flex items-center gap-2">
                  <span className="font-medium truncate max-w-[120px]">{participant.name}</span>
                  {participant.isHost && <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded text-white font-bold">מנחה</span>}
                </div>
                <div className="flex gap-2">
                  <div className={`p-1.5 rounded-lg backdrop-blur-md ${((participant.isLocal && micEnabled) || (!participant.isLocal && participant.micOn)) ? 'bg-black/50 text-white' : 'bg-red-500 text-white'}`}>
                    {((participant.isLocal && micEnabled) || (!participant.isLocal && participant.micOn)) ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900/95 backdrop-blur-md p-4 flex justify-center gap-4 z-20 border-t border-gray-800">
          <button onClick={() => toggleMedia('audio')} className={`p-4 rounded-xl transition-colors ${micEnabled ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
            {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          <button onClick={() => toggleMedia('video')} className={`p-4 rounded-xl transition-colors ${cameraEnabled ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
            {cameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
          <button onClick={() => setHandRaised(!handRaised)} className={`p-4 rounded-xl transition-colors ${handRaised ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
            <Hand className="w-6 h-6" />
          </button>
          <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-white transition-colors"><MonitorUp className="w-6 h-6" /></button>
          <div className="w-px h-10 bg-gray-700 mx-2 self-center"></div>
          <button onClick={onLeave} className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg">
             <PhoneCall className="w-5 h-5 transform rotate-[135deg]" /> עזוב
          </button>
        </div>
      </div>

      <div className="w-96 bg-gray-50 flex flex-col z-20 border-l border-gray-200">
        
        <div className="flex bg-white border-b border-gray-200 p-2 gap-1 relative">
          <button onClick={() => setActiveTab('participants')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'participants' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Users className="w-4 h-4" /> קבוצה
            {waitingRoom.length > 0 && <span className="bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full absolute top-1 right-2 animate-bounce">{waitingRoom.length}</span>}
          </button>
          <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'chat' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <MessageSquare className="w-4 h-4" /> צ'אט
          </button>
          <button onClick={() => setActiveTab('whiteboard')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'whiteboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <PenTool className="w-4 h-4" /> לוח
          </button>
          <button onClick={() => setActiveTab('poker')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'poker' ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <span className="text-lg leading-none">♠️</span> פוקר
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          
          {activeTab === 'participants' && (
            <div className="flex flex-col h-full">
              {isHost && waitingRoom.length > 0 && (
                <div className="p-4 bg-orange-50 border-b border-orange-100">
                  <h3 className="text-sm font-bold text-orange-800 flex items-center gap-2 mb-3">
                    <UserPlus className="w-4 h-4" /> חדר המתנה ({waitingRoom.length})
                  </h3>
                  <div className="space-y-2">
                    {waitingRoom.map(user => (
                      <div key={user.id} className="bg-white p-3 rounded-lg border border-orange-200 flex justify-between items-center shadow-sm">
                        <div>
                          <div className="font-bold text-gray-800 text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500">ממתין מ- {user.time}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => denyUser(user.id)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 rounded-md transition-colors" title="סרב">
                            <X className="w-5 h-5" />
                          </button>
                          <button onClick={() => admitUser(user)} className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-md text-sm font-bold transition-colors flex items-center gap-1 shadow-sm">
                            <Check className="w-4 h-4" /> אשר
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-700">בשיחה ({participants.length})</h3>
                  {isHost && (
                    <button onClick={muteAll} className="text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition-colors">
                      השתק את כולם
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {participants.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          {p.img ? <img src={p.img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">{p.name.charAt(0)}</div>}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800 flex items-center gap-1">
                            {p.name}
                            {p.isLocal && <span className="text-xs font-normal text-gray-400">(אתה)</span>}
                          </div>
                          {p.isHost && <div className="text-[10px] text-blue-600 font-bold">מנחה</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        {p.micOn ? <Mic className="w-4 h-4 text-gray-600" /> : <MicOff className="w-4 h-4 text-red-500" />}
                        {p.camOn ? <Video className="w-4 h-4 text-gray-600" /> : <VideoOff className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col p-4 bg-gray-50">
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                {messages.length === 0 ? <div className="text-center text-gray-400 text-sm mt-10">אין הודעות...</div> : messages.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.senderId === currentUser?.uid ? 'items-start' : 'items-end'}`}>
                    <div className={`px-4 py-2 rounded-2xl max-w-[90%] text-sm ${msg.senderId === currentUser?.uid ? 'bg-teal-500 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>{msg.text}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="הקלד הודעה..." className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none" />
                <button type="submit" className="bg-teal-500 text-white p-2 rounded-full"><Send className="w-4 h-4" /></button>
              </form>
            </div>
          )}
          
          {activeTab === 'whiteboard' && (
            <div className="h-full w-full"><WhiteboardWidget /></div>
          )}

          {activeTab === 'poker' && (
            <div className="h-full w-full p-2 bg-slate-950 rounded-xl relative">
              <PokerWidget isHost={isHost} mode="play" />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
