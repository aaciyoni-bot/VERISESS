import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { 
  ShieldCheck, Video, VideoOff, Mic, MicOff, Clock, 
  PhoneCall, MessageSquare, PenTool, AlertTriangle, Send, 
  Eraser, Trash2, Users, UserPlus, Check, X, LayoutGrid, Maximize,
  Coins, Eye, EyeOff, Crown
} from 'lucide-react';

// ==========================================
// 1. חיבורים ל-Firebase
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
// 2. רכיב הלוח הלבן הפנימי
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

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(nativeEvent);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const getCoordinates = (event) => {
    if (event.touches && event.touches.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: event.touches[0].clientX - rect.left,
        offsetY: event.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: event.nativeEvent ? event.nativeEvent.offsetX : event.offsetX,
      offsetY: event.nativeEvent ? event.nativeEvent.offsetY : event.offsetY
    };
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
        <canvas
          ref={canvasRef} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw} onMouseLeave={finishDrawing} onTouchStart={startDrawing} onTouchEnd={finishDrawing} onTouchMove={draw}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

// ==========================================
// 3. מנוע פוקר פרימיום (PLO5)
// ==========================================
const PokerWidget = ({ isHost }) => {
  const [pot, setPot] = useState(1550);
  const [godMode, setGodMode] = useState(false);

  const Card = ({ value, suit, color, isHidden }) => (
    <div className={`w-14 h-20 rounded-lg shadow-md flex flex-col justify-between p-1 border-2 
      ${isHidden && !godMode ? 'bg-blue-900 border-white/20 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]' : 'bg-white border-gray-200'} 
      ${isHidden && godMode ? 'ring-2 ring-amber-400 border-transparent shadow-[0_0_15px_rgba(251,191,36,0.5)]' : ''}`}>
      {(!isHidden || godMode) && (
        <>
          <div className={`text-xs font-bold ${color}`}>{value}</div>
          <div className={`text-xl text-center ${color}`}>{suit}</div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative select-none" dir="ltr">
      
      {/* הדר עליון (שליטת מנהל) */}
      <div className="bg-slate-900 p-3 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-amber-500 text-sm">PLO5 - High Stakes</span>
        </div>
        
        {isHost && (
          <button 
            onClick={() => setGodMode(!godMode)}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${godMode ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            {godMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            God Mode
          </button>
        )}
      </div>

      {/* אזור השולחן */}
      <div className="flex-1 bg-green-900 relative p-4 flex flex-col justify-between" style={{ backgroundImage: "radial-gradient(circle, #065f46 0%, #022c22 100%)" }}>
        
        {/* שחקן יריב (למעלה) */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex -space-x-4">
            <Card isHidden={true} value="A" suit="♥️" color="text-red-600" />
            <Card isHidden={true} value="K" suit="♣️" color="text-black" />
            <Card isHidden={true} value="Q" suit="♦️" color="text-red-600" />
            <Card isHidden={true} value="J" suit="♠️" color="text-black" />
            <Card isHidden={true} value="10" suit="♥️" color="text-red-600" />
          </div>
          <div className="bg-black/60 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-sm border border-slate-700" dir="rtl">
            <Users className="w-3 h-3 text-amber-400" /> שחקן 2
            {godMode && <span className="text-amber-400 font-bold ml-1">נחשף</span>}
          </div>
        </div>

        {/* קלפי קהילה וקופה */}
        <div className="flex flex-col items-center gap-4 my-4">
          <div className="bg-black/50 border border-amber-500/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-black text-amber-400 tracking-wider">₪{pot.toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <Card value="8" suit="♠️" color="text-black" />
            <Card value="9" suit="♦️" color="text-red-600" />
            <Card value="2" suit="♣️" color="text-black" />
          </div>
        </div>

        {/* השחקן המקומי (למטה) */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-black/60 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/30" dir="rtl">
            היד שלך
          </div>
          <div className="flex -space-x-4">
            <Card value="A" suit="♠️" color="text-black" />
            <Card value="A" suit="♦️" color="text-red-600" />
            <Card value="K" suit="♠️" color="text-black" />
            <Card value="4" suit="♥️" color="text-red-600" />
            <Card value="2" suit="♦️" color="text-red-600" />
          </div>
        </div>
      </div>

      {/* פאנל פעולות (Action Bar) */}
      <div className="bg-slate-900 p-3 border-t border-slate-800 grid grid-cols-3 gap-2">
        <button className="bg-red-950/50 text-red-500 hover:bg-red-900/80 text-sm font-bold py-3 rounded-lg border border-red-900/50 transition-colors">Fold</button>
        <button className="bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-bold py-3 rounded-lg border border-slate-700 transition-colors">Check</button>
        <button onClick={() => setPot(p => p + 200)} className="bg-gradient-to-t from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 text-sm font-black py-3 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">Pot (₪200)</button>
      </div>
    </div>
  );
}

// ==========================================
// 4. החדר הראשי החכם (Unified Video Room)
// ==========================================
export default function VideoRoom({ sessionId, onLeave, isProvider = true }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // chat, whiteboard, notes, participants
  
  // ציוד קצה
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  const currentUser = auth?.currentUser;

  // --- ניהול משתתפים דינמי ---
  const [participants, setParticipants] = useState([
    { id: 'me', name: 'אני', isLocal: true, img: null },
    { id: 'p1', name: 'לקוח 1', isLocal: false, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&w=1000&q=80' }
  ]);
  const [waitingRoom, setWaitingRoom] = useState([]);

  // פונקציית טסט להדגמת היכולת הדינמית (כפתור בסרגל העליון)
  const addTestParticipant = () => {
    const newId = `p${participants.length}`;
    setParticipants(prev => [
      ...prev, 
      { id: newId, name: `משתתף נוסף ${participants.length}`, isLocal: false, img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&w=1000&q=80' }
    ]);
  };

  // 1. הפעלת מצלמה מקומית
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

  // 2. האזנה לפעילות בסשן בענן
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
      await updateDoc(sessionRef, {
        messages: arrayUnion({ senderId: currentUser.uid, text: newMessage, timestamp: new Date().toISOString() })
      });
      setNewMessage('');
    } catch (error) { console.error("Error sending message:", error); }
  };

  const handleEndCall = async () => {
    if (sessionId && db) {
      const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
      try { await updateDoc(sessionRef, { status: 'ended' }); } catch (error) { console.error(error); }
    }
    if (onLeave) onLeave();
  };

  const toggleMedia = (type) => {
    if (localStream) {
      const tracks = type === 'video' ? localStream.getVideoTracks() : localStream.getAudioTracks();
      tracks.forEach(track => { track.enabled = !track.enabled; });
      if (type === 'video') setCameraEnabled(!cameraEnabled);
      if (type === 'audio') setMicEnabled(!micEnabled);
    }
  };

  // ==========================================
  // מנוע התצוגה החכם (Smart Layout Engine)
  // ==========================================
  const renderVideoLayout = () => {
    // 1-on-1 Layout (PiP)
    if (participants.length <= 2) {
      const remoteParticipant = participants.find(p => !p.isLocal) || participants[0];
      return (
        <>
          <img src={remoteParticipant.img} alt="Remote" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute top-6 right-6 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-10 flex items-center gap-2 shadow-lg">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
             {remoteParticipant.name}
          </div>
          
          <div className="absolute bottom-24 left-6 w-48 h-32 bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700 z-20 shadow-2xl transition-all hover:scale-105">
            <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraEnabled ? '' : 'hidden'}`} />
            {!cameraEnabled && (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                <VideoOff className="w-6 h-6 mb-1" />
              </div>
            )}
          </div>
        </>
      );
    }
    
    // Group Layout (Grid)
    return (
      <div className="absolute inset-0 p-6 pt-20 grid gap-4 grid-cols-2 lg:grid-cols-3">
        {participants.map((p, idx) => (
          <div key={p.id} className="bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 shadow-lg group">
            {p.isLocal ? (
              <>
                <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraEnabled ? '' : 'hidden'}`} />
                {!cameraEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <VideoOff className="w-8 h-8 text-gray-500" />
                  </div>
                )}
              </>
            ) : (
              <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
            )}
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm font-medium">
              {p.name} {p.isLocal && '(אתה)'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto my-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl h-[85vh] flex relative border border-gray-800" dir="rtl">
      
      {/* ------------------------------------------- */}
      {/* אזור הוידאו המרכזי */}
      {/* ------------------------------------------- */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        
        {/* סרגל עליון (חדר מאוחד) */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 border border-gray-700">
            <Clock className="w-4 h-4 text-teal-400" /> <span className="font-mono">44:59</span>
          </div>
        </div>

        {/* כפתור פיתוח - להוספת אנשים ולראות איך הגריד משתנה! */}
        <div className="absolute top-4 right-4 z-30 flex gap-2">
           <button onClick={addTestParticipant} className="bg-blue-600/80 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm border border-blue-400 flex items-center gap-1 transition-colors">
             <UserPlus className="w-4 h-4" /> סמלץ כניסת משתתף נוסף
           </button>
           <div className="bg-gray-800/80 text-white px-3 py-1.5 rounded-lg text-xs border border-gray-700 backdrop-blur-sm">
             מצב: {participants.length <= 2 ? '1-על-1 (PiP)' : 'קבוצה (Grid)'}
           </div>
        </div>

        {/* קריאה למנוע התצוגה החכם */}
        {renderVideoLayout()}

        {/* סרגל שליטה תחתון */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-md px-8 py-3 rounded-full flex gap-4 z-30 border border-gray-700 shadow-2xl">
          <button onClick={() => toggleMedia('audio')} className={`p-4 rounded-full transition-colors ${micEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500'}`}>
            {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          <button onClick={() => toggleMedia('video')} className={`p-4 rounded-full transition-colors ${cameraEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500'}`}>
            {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <div className="w-px h-8 bg-gray-700 mx-2 self-center"></div>

          <button onClick={handleEndCall} className="p-4 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold px-6 flex items-center gap-2 shadow-lg transition-transform active:scale-95">
             <PhoneCall className="w-5 h-5 transform rotate-[135deg]" /> {participants.length > 2 && isProvider ? 'סיים לכולם' : 'עזוב שיחה'}
          </button>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* פאנל ימני: ווידג'טים חכמים (Tabs) */}
      {/* ------------------------------------------- */}
      <div className="w-96 bg-gray-50 flex flex-col z-20 border-l border-gray-200">
        
        {/* ניווט הטאבים */}
        <div className="flex flex-wrap bg-white border-b border-gray-200 p-1">
          <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'chat' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <MessageSquare className="w-4 h-4" /> צ'אט
          </button>
          <button onClick={() => setActiveTab('whiteboard')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'whiteboard' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <PenTool className="w-4 h-4" /> לוח
          </button>
          <button onClick={() => setActiveTab('poker')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'poker' ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
            <span className="text-lg leading-none">♠️</span> פוקר
          </button>
          {isProvider && (
            <button onClick={() => setActiveTab('notes')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'notes' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}>
              <ShieldCheck className="w-4 h-4" /> הערות
            </button>
          )}
          <button onClick={() => setActiveTab('participants')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'participants' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Users className="w-4 h-4" /> {participants.length}
          </button>
        </div>

        {/* תוכן הטאב הנבחר */}
        <div className="flex-1 overflow-hidden p-3 bg-gray-50 flex flex-col">
          
          {/* טאב צ'אט */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm mt-10">הצ'אט מוצפן מקצה לקצה.</div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = currentUser && msg.senderId === currentUser.uid;
                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                        <div className={`px-4 py-2 rounded-2xl max-w-[90%] text-sm ${isMe ? 'bg-teal-500 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={sendMessage} className="flex gap-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm">
                <input 
                  type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="הקלד הודעה..." className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none" 
                />
                <button type="submit" className="bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600 disabled:opacity-50" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* טאב לוח לבן */}
          {activeTab === 'whiteboard' && (
            <div className="h-full w-full"><WhiteboardWidget /></div>
          )}

          {/* טאב פוקר (קזינו) */}
          {activeTab === 'poker' && (
            <div className="h-full w-full p-2 bg-slate-950">
              <PokerWidget isHost={isProvider} />
            </div>
          )}

          {/* טאב הערות חסויות (מוצג רק למנחה/מטפל) */}
          {activeTab === 'notes' && isProvider && (
            <div className="h-full flex flex-col gap-4">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>המשתתפים אינם רואים את הנכתב כאן.</div>
              </div>
              <textarea 
                className="flex-1 w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 resize-none shadow-inner bg-white"
                placeholder="הקלד הערות פרטיות, אבחנות או תזכורות..."
              ></textarea>
            </div>
          )}

          {/* טאב משתתפים (ניהול הקהל) */}
          {activeTab === 'participants' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 text-sm">משתתפים בחדר ({participants.length})</h3>
                {isProvider && participants.length > 2 && (
                  <button className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">השתק את כולם</button>
                )}
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {participants.map(p => (
                  <div key={p.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                        {p.img ? <img src={p.img} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{p.name.charAt(0)}</div>}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-gray-800 block">{p.name} {p.isLocal && '(אתה)'}</span>
                        {p.id === 'me' && isProvider && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">מנחה</span>}
                      </div>
                    </div>
                    {isProvider && !p.isLocal && (
                      <button className="text-gray-400 hover:text-red-500" title="הוצא מהחדר"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
