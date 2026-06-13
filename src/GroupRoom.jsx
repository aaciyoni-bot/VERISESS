import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Video, VideoOff, Mic, MicOff, Clock, 
  PhoneCall, MessageSquare, PenTool, Users, ShieldAlert,
  UserPlus, Check, X, LayoutGrid, MonitorUp, Hand
} from 'lucide-react';

export default function GroupRoom({ sessionId, onLeave, isHost = true }) {
  // --- ניהול מצב חדר קבוצתי ---
  const [activeTab, setActiveTab] = useState('participants'); // chat, whiteboard, notes, participants
  
  // ציוד קצה מקומי
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);

  // משתתפים וחדר המתנה (בפרודקשן ינוהל מול Firebase ושרת WebRTC SFU)
  const [participants, setParticipants] = useState([
    { id: 'me', name: 'אני (מנחה)', isHost: true, micOn: true, camOn: true, isLocal: true },
    { id: 'p1', name: 'ישראל ישראלי', isHost: false, micOn: false, camOn: true, isLocal: false, img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' },
  ]);
  
  const [waitingRoom, setWaitingRoom] = useState([]);

  // 1. הפעלת מצלמה מקומית
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

    // סימולציה: מישהו דופק בדלת אחרי 5 שניות
    const timer = setTimeout(() => {
      setWaitingRoom([
        { id: 'wait_1', name: 'דנה כהן (מטופלת)', role: 'client', time: '14:02' }
      ]);
    }, 5000);

    return () => {
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      clearTimeout(timer);
    };
  }, []);

  // --- פעולות מנחה (Host Controls) ---
  
  const admitUser = (user) => {
    // מסיר מחדר ההמתנה
    setWaitingRoom(prev => prev.filter(u => u.id !== user.id));
    // מוסיף לחדר
    setParticipants(prev => [...prev, {
      id: user.id,
      name: user.name,
      isHost: false,
      micOn: true,
      camOn: true,
      isLocal: false,
      img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    }]);
    setActiveTab('participants'); // פוקוס על המשתתפים
  };

  const denyUser = (userId) => {
    setWaitingRoom(prev => prev.filter(u => u.id !== userId));
  };

  const muteAll = () => {
    setParticipants(prev => prev.map(p => p.isLocal ? p : { ...p, micOn: false }));
  };

  const toggleMedia = (type) => {
    if (localStream) {
      const tracks = type === 'video' ? localStream.getVideoTracks() : localStream.getAudioTracks();
      tracks.forEach(track => { track.enabled = !track.enabled; });
      if (type === 'video') setCameraEnabled(!cameraEnabled);
      if (type === 'audio') setMicEnabled(!micEnabled);
    }
  };

  // חישוב גודל הרשת (Grid) בהתאם לכמות המשתתפים
  const getGridClass = () => {
    const count = participants.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2 grid-rows-2";
    if (count <= 6) return "grid-cols-3 grid-rows-2";
    return "grid-cols-3 grid-rows-3"; // עד 9 משתתפים בתצוגה נוכחית
  };

  return (
    <div className="max-w-7xl mx-auto my-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl h-[85vh] flex relative border border-gray-800" dir="rtl">
      
      {/* ========================================== */}
      {/* אזור הוידאו המרכזי (Grid) */}
      {/* ========================================== */}
      <div className="flex-1 relative bg-black flex flex-col overflow-hidden">
        
        {/* כותרת החדר (הגדרות אבטחה וטיימר) */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <div className="bg-gray-800/80 backdrop-blur text-white px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-700 text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              חדר קבוצתי (E2EE)
            </div>
            {isHost && (
              <div className="bg-teal-900/80 backdrop-blur text-teal-100 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-teal-700 text-sm">
                <ShieldAlert className="w-4 h-4" />
                אתה המנחה
              </div>
            )}
          </div>
          <div className="bg-black/60 text-white px-4 py-1.5 rounded-lg backdrop-blur-sm flex items-center gap-2 border border-gray-700 font-mono pointer-events-auto">
            <Clock className="w-4 h-4 text-gray-400" /> 44:59
          </div>
        </div>

        {/* רשת המשתתפים (Dynamic Grid) */}
        <div className={`flex-1 p-4 mt-12 grid gap-4 ${getGridClass()}`}>
          {participants.map((participant) => (
            <div key={participant.id} className="bg-gray-800 rounded-xl overflow-hidden relative border border-gray-700 shadow-lg group">
              {participant.isLocal ? (
                // וידאו מקומי
                <>
                  <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${cameraEnabled ? '' : 'hidden'}`} />
                  {!cameraEnabled && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500 mb-2">א</div>
                    </div>
                  )}
                </>
              ) : (
                // וידאו מרוחק (סימולציה)
                <>
                  <img src={participant.img} alt={participant.name} className={`w-full h-full object-cover ${participant.camOn ? '' : 'hidden'}`} />
                  {!participant.camOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500 mb-2">{participant.name.charAt(0)}</div>
                    </div>
                  )}
                </>
              )}

              {/* תגיות שם וסטטוס (על גבי הוידאו) */}
              <div className="absolute bottom-3 right-3 left-3 flex justify-between items-end">
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-sm flex items-center gap-2">
                  <span className="font-medium truncate max-w-[120px]">{participant.name}</span>
                  {participant.isHost && <span className="text-[10px] bg-blue-600 px-1.5 py-0.5 rounded text-white font-bold">מנחה</span>}
                </div>
                
                <div className="flex gap-2">
                  {/* חיווי מיקרופון */}
                  <div className={`p-1.5 rounded-lg backdrop-blur-md ${((participant.isLocal && micEnabled) || (!participant.isLocal && participant.micOn)) ? 'bg-black/50 text-white' : 'bg-red-500 text-white'}`}>
                    {((participant.isLocal && micEnabled) || (!participant.isLocal && participant.micOn)) ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* אינדיקטור "מדבר עכשיו" */}
              {((participant.isLocal && micEnabled) || (!participant.isLocal && participant.micOn)) && (
                <div className="absolute inset-0 border-4 border-teal-500 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
            </div>
          ))}
        </div>

        {/* סרגל שליטה תחתון המרכזי */}
        <div className="bg-gray-900/95 backdrop-blur-md p-4 flex justify-center gap-4 z-20 border-t border-gray-800">
          <button onClick={() => toggleMedia('audio')} className={`p-4 rounded-xl transition-colors ${micEnabled ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
            {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          
          <button onClick={() => toggleMedia('video')} className={`p-4 rounded-xl transition-colors ${cameraEnabled ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
            {cameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button onClick={() => setHandRaised(!handRaised)} className={`p-4 rounded-xl transition-colors ${handRaised ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-gray-800 hover:bg-gray-700 text-white'}`} title="הצבע (בקש רשות דיבור)">
            <Hand className="w-6 h-6" />
          </button>

          <button className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-white transition-colors" title="שיתוף מסך">
            <MonitorUp className="w-6 h-6" />
          </button>

          <div className="w-px h-10 bg-gray-700 mx-2 self-center"></div>

          <button onClick={onLeave} className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl text-white font-bold flex items-center gap-2 shadow-lg">
             <PhoneCall className="w-5 h-5 transform rotate-[135deg]" /> עזוב חדר
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* פאנל ימני: ווידג'טים וניהול משתתפים */}
      {/* ========================================== */}
      <div className="w-96 bg-gray-50 flex flex-col z-20 border-l border-gray-200">
        
        {/* תפריט טאבים משודרג */}
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
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          
          {/* טאב משתתפים (Participants & Waiting Room) */}
          {activeTab === 'participants' && (
            <div className="flex flex-col h-full">
              
              {/* חדר המתנה (מוצג רק למנחה כשיש ממתינים) */}
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

              {/* רשימת המשתתפים בחדר */}
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

          {/* שאר הטאבים - סימולציה ויזואלית לשמירה על הרצף */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col p-4 bg-gray-50">
              <div className="text-center text-xs text-gray-400 mb-4 bg-gray-200 rounded-full py-1">צ'אט קבוצתי (מוצפן)</div>
              <div className="flex-1 text-center text-gray-500 mt-10">אין הודעות עדיין...</div>
            </div>
          )}
          
          {activeTab === 'whiteboard' && (
            <div className="flex-1 p-4 flex flex-col items-center justify-center text-center bg-gray-50">
              <PenTool className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-600 font-bold">הלוח הלבן מוכן</p>
              <p className="text-sm text-gray-400">רכיב הציור ישולב כאן (כפי שנבנה ב-WhiteboardWidget)</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
