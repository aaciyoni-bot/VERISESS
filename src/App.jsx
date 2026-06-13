import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { 
  ShieldCheck, Video, VideoOff, Mic, MicOff, Clock, 
  PhoneCall, MessageSquare, PenTool, AlertTriangle, Send, Eraser, Trash2
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
// 2. ווידג'ט: לוח לבן משותף (Whiteboard)
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
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5 select-none overflow-hidden">
          <span className="text-4xl font-black text-gray-400 rotate-[-30deg]">VeriSess</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. החדר הראשי (Video Room)
// ==========================================
export default function VideoRoom({ sessionId, onLeave }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // chat, whiteboard, notes
  
  // ציוד קצה
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  const currentUser = auth?.currentUser;

  // 1. הפעלת מצלמה ומיקרופון מקומיים (WebRTC)
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        console.error("שגיאה בגישה למצלמה:", err);
      }
    };
    initCamera();

    // ניקוי המצלמה כשעוזבים את החדר
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. האזנה לפעילות בסשן (משיכת הודעות בזמן אמת מה-DB)
  useEffect(() => {
    if (!sessionId || !db) return;
    
    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
    const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMessages(data.messages || []);
        
        // אם הצד השני סיים את השיחה
        if (data.status === 'ended') {
           alert("השיחה הסתיימה.");
           if (onLeave) onLeave();
        }
      }
    });

    return () => unsubscribe();
  }, [sessionId, onLeave]);

  // שליחת הודעה בצ'אט (שמירה ב-Firebase)
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionId || !currentUser) return;
    
    const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
    try {
      await updateDoc(sessionRef, {
        messages: arrayUnion({
          senderId: currentUser.uid,
          text: newMessage,
          timestamp: new Date().toISOString()
        })
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleEndCall = async () => {
    if (sessionId && db) {
      const sessionRef = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', sessionId);
      await updateDoc(sessionRef, { status: 'ended' });
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

  return (
    <div className="max-w-7xl mx-auto my-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl h-[85vh] flex relative border border-gray-800" dir="rtl">
      
      {/* אזור הוידאו המרכזי */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        
        {/* סימולציה של וידאו מרוחק (Remote Stream) */}
        {/* בפרודקשן אמיתי כאן יוזרק ה-Video Track מ-Twilio/LiveKit */}
        <div className="absolute inset-0 flex items-center justify-center">
           <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&w=1000&q=80" alt="Remote Video Mock" className="w-full h-full object-cover opacity-70" />
        </div>
        
        {/* טיימר ואבטחה מצד ימין למעלה */}
        <div className="absolute top-6 right-6 bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-10 flex items-center gap-3 border border-gray-700">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <div className="flex items-center gap-1 font-mono font-bold tracking-wider">
            <Clock className="w-4 h-4 text-gray-400" /> 44:59
          </div>
        </div>

        {/* וידאו מקומי (המצלמה שלך) - פינה שמאלית תחתונה */}
        <div className="absolute bottom-24 left-6 w-48 h-32 bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700 z-20 shadow-xl">
          <video 
            ref={localVideoRef} 
            autoPlay playsInline muted 
            className={`w-full h-full object-cover ${cameraEnabled ? '' : 'hidden'}`} 
          />
          {!cameraEnabled && (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900">
              <VideoOff className="w-8 h-8 mb-1" />
              <span className="text-xs">מצלמה כבויה</span>
            </div>
          )}
        </div>

        {/* סרגל שליטה תחתון */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-md px-8 py-3 rounded-full flex gap-4 z-20 border border-gray-700">
          <button 
            onClick={() => toggleMedia('audio')}
            className={`p-3 rounded-full transition-colors ${micEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500'}`}
          >
            {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={() => toggleMedia('video')}
            className={`p-3 rounded-full transition-colors ${cameraEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 text-red-500'}`}
          >
            {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <div className="w-px h-8 bg-gray-700 mx-2 self-center"></div>

          <button onClick={handleEndCall} className="p-3 bg-red-600 hover:bg-red-700 rounded-full text-white font-bold px-6 flex items-center gap-2 shadow-lg">
             <PhoneCall className="w-5 h-5 transform rotate-[135deg]" /> נתק שיחה
          </button>
        </div>
      </div>

      {/* פאנל ימני: מנוע הווידג'טים החכם */}
      <div className="w-96 bg-gray-50 flex flex-col z-20 border-l border-gray-200">
        
        {/* כותרת הפאנל ותפריט טאבים */}
        <div className="flex bg-white border-b border-gray-200 p-2 gap-1">
          <button onClick={() => setActiveTab('chat')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <MessageSquare className="w-4 h-4" /> צ'אט חי
          </button>
          <button onClick={() => setActiveTab('whiteboard')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'whiteboard' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <PenTool className="w-4 h-4" /> לוח משותף
          </button>
          <button onClick={() => setActiveTab('notes')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'notes' ? 'bg-teal-50 text-teal-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <ShieldCheck className="w-4 h-4" /> הערות חסויות
          </button>
        </div>

        {/* תוכן הטאב הנבחר */}
        <div className="flex-1 overflow-hidden p-3 bg-gray-50 flex flex-col">
          
          {/* טאב 1: צ'אט (Chat) */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm mt-10">הצ'אט מוצפן מקצה לקצה. התחל לשוחח...</div>
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
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="הקלד הודעה..." 
                  className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none" 
                />
                <button type="submit" className="bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600 disabled:opacity-50" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* טאב 2: לוח לבן (Whiteboard) */}
          {activeTab === 'whiteboard' && (
            <div className="h-full w-full">
              <WhiteboardWidget />
            </div>
          )}

          {/* טאב 3: הערות חסויות (Private Notes) */}
          {activeTab === 'notes' && (
            <div className="h-full flex flex-col gap-4">
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div>הצד השני לא רואה את הנכתב כאן. ההערות יישמרו בתיק האישי לאחר השיחה.</div>
              </div>
              <textarea 
                className="flex-1 w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 resize-none shadow-inner bg-white"
                placeholder="הקלד הערות פרטיות, אבחנות או תזכורות..."
              ></textarea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
