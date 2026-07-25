import React, { useState } from 'react';
import { Coins, Eye, EyeOff, Users, Crown, HandCoins, DollarSign, Layers, Timer, RefreshCcw } from 'lucide-react';

export default function RummikubWidget({ isHost, mode = 'real' }) {
  const [pot, setPot] = useState(800); // קופת המשחק
  const [godMode, setGodMode] = useState(false);
  const [totalRake, setTotalRake] = useState(0);
  const RAKE_PERCENTAGE = 0.05; // 5% עמלה
  const [timeLeft, setTimeLeft] = useState(45); // טיימר לתור

  const handleWinPot = () => {
    if (pot === 0) return;
    if (mode === 'real') {
      const rakeAmount = pot * RAKE_PERCENTAGE;
      setTotalRake(prev => prev + rakeAmount);
      alert(`שחקן הכריז רמי! הקופה: ₪${pot}. עמלת מועדון (Rake): ₪${rakeAmount.toFixed(2)}`);
    } else {
      alert(`שחקן ניצח! חולקו ${pot} צ'יפים וירטואליים.`);
    }
    setPot(0);
  };

  // קומפוננטת אריח (Tile) רמיקוב
  const Tile = ({ value, colorClass, isHidden, isJoker = false }) => (
    <div className={`w-10 h-14 md:w-12 md:h-16 rounded-md shadow-md flex items-center justify-center border-b-4 
      ${isHidden && !godMode ? 'bg-amber-100 border-amber-300' : 'bg-white border-gray-300'} 
      ${isHidden && godMode ? 'ring-2 ring-amber-400 border-b-gray-300 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : ''}
      transition-transform hover:-translate-y-2 cursor-pointer relative`}
    >
      {/* תצוגת האריח - אם מוסתר ולא במצב God Mode, מראה גב חלק */}
      {isHidden && !godMode ? (
        <div className="text-amber-800/20"><Layers className="w-6 h-6" /></div>
      ) : (
        <>
          {isJoker ? (
            <div className={`text-2xl md:text-3xl ${colorClass}`}>☻</div>
          ) : (
            <div className={`text-2xl md:text-3xl font-black ${colorClass}`}>{value}</div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative select-none" dir="ltr">
      
      {/* --- הדר עליון (שליטת מנהל ונתונים) --- */}
      <div className="bg-slate-950 p-3 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Crown className={`w-5 h-5 ${mode === 'real' ? 'text-amber-500' : 'text-blue-400'}`} />
          <div>
            <span className={`font-bold text-sm block ${mode === 'real' ? 'text-amber-500' : 'text-blue-400'}`}>Rummikub - {mode === 'real' ? 'VIP Club' : 'חוג למידה'}</span>
            <span className="text-[10px] text-slate-500 font-mono">{mode === 'real' ? 'REAL MONEY (Escrow)' : 'PLAY MONEY'}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isHost && mode === 'real' && (
            <div className="bg-green-900/30 border border-green-500/30 px-3 py-1 rounded-full flex items-center gap-1" title="עמלות שנגזרו">
              <DollarSign className="w-3 h-3 text-green-400" /><span className="text-green-400 text-xs font-bold">Rake: ₪{totalRake.toFixed(0)}</span>
            </div>
          )}
          {isHost && mode === 'play' && (
            <button onClick={() => alert("חולקו אריחים/צ'יפים")} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-sm">
              <HandCoins className="w-3 h-3" /> חלק לשחקנים
            </button>
          )}
          {isHost && (
            <button onClick={() => setGodMode(!godMode)} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${godMode ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`} title="חשוף אריחים של אחרים למניעת רמאויות">
              {godMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />} God Mode
            </button>
          )}
        </div>
      </div>

      {/* --- לוח המשחק (השולחן) --- */}
      <div className="flex-1 bg-slate-800 relative p-4 flex flex-col justify-between" style={{ backgroundImage: "radial-gradient(circle, #334155 0%, #0f172a 100%)" }}>
        
        {/* תושבת יריב (Opponent Rack) */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex -space-x-2 opacity-90 scale-90">
            {/* סימולציית 10 אריחים של היריב */}
            <Tile isHidden={true} value="7" colorClass="text-red-500" />
            <Tile isHidden={true} value="8" colorClass="text-red-500" />
            <Tile isHidden={true} value="9" colorClass="text-red-500" />
            <Tile isHidden={true} value="2" colorClass="text-blue-500" />
            <Tile isHidden={true} value="2" colorClass="text-amber-500" />
            <Tile isHidden={true} value="2" colorClass="text-slate-900" />
            <Tile isHidden={true} isJoker={true} colorClass="text-red-500" />
            <Tile isHidden={true} value="13" colorClass="text-blue-500" />
          </div>
          <div className="bg-black/40 text-gray-300 text-xs px-3 py-1 rounded-full flex items-center gap-2 border border-slate-700 backdrop-blur-sm" dir="rtl">
            <Users className="w-3 h-3 text-gray-400" /> תושבת יריב (8 אריחים)
          </div>
        </div>

        {/* אמצע הלוח: קופה, סדרות (Melds) והקופה המרכזית */}
        <div className="flex flex-col items-center justify-center my-4 gap-6">
          
          <div className="bg-black/50 border border-amber-500/30 px-6 py-2 rounded-full flex items-center gap-3 shadow-lg backdrop-blur-md cursor-pointer hover:bg-black/70 transition-colors" onClick={handleWinPot} title="לחץ לסימולציית זכייה ברמי">
            <Coins className={`w-5 h-5 ${mode === 'real' ? 'text-amber-400' : 'text-blue-300'}`} />
            <div className="flex flex-col items-start">
              <span className={`font-black text-xl leading-none tracking-wider ${mode === 'real' ? 'text-amber-400' : 'text-blue-300'}`}>{mode === 'real' ? '₪' : 'Chips: '}{pot.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Main Pot</span>
            </div>
          </div>

          {/* סדרות שהורדו ללוח (Board) */}
          <div className="flex flex-wrap justify-center gap-6 bg-slate-900/40 p-4 rounded-2xl border border-slate-700/50 w-full min-h-[120px]">
            {/* סדרה 1: 7-8-9 שחור */}
            <div className="flex gap-1 bg-black/20 p-2 rounded-lg border border-slate-600">
              <Tile value="7" colorClass="text-slate-900" />
              <Tile value="8" colorClass="text-slate-900" />
              <Tile value="9" colorClass="text-slate-900" />
            </div>
            
            {/* קבוצה 1: 4 צבעים שונים */}
            <div className="flex gap-1 bg-black/20 p-2 rounded-lg border border-slate-600">
              <Tile value="4" colorClass="text-blue-500" />
              <Tile value="4" colorClass="text-amber-500" />
              <Tile value="4" colorClass="text-red-500" />
            </div>

            {/* סדרה עם ג'וקר */}
            <div className="flex gap-1 bg-black/20 p-2 rounded-lg border border-slate-600">
              <Tile value="11" colorClass="text-amber-500" />
              <Tile value="12" colorClass="text-amber-500" />
              <Tile isJoker={true} colorClass="text-slate-900" />
            </div>
          </div>
        </div>

        {/* התושבת שלי (My Rack) */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-between w-full px-4" dir="rtl">
            <div className="bg-blue-900/60 text-blue-200 text-xs px-3 py-1 rounded-full border border-blue-700/50 flex items-center gap-2">
              <Timer className="w-3 h-3" /> תור נוכחי: {timeLeft} שנ'
            </div>
            <div className="bg-black/60 text-white text-xs px-4 py-1 rounded-t-xl border-t border-x border-slate-600">
              התושבת שלך (Rack)
            </div>
            <div className="flex gap-2">
              <button className="text-xs text-slate-400 hover:text-white bg-slate-900 px-2 py-1 rounded border border-slate-700 transition" title="סדר לפי צבע/קבוצה">777</button>
              <button className="text-xs text-slate-400 hover:text-white bg-slate-900 px-2 py-1 rounded border border-slate-700 transition" title="סדר לפי רצף">789</button>
            </div>
          </div>
          
          {/* רקע של עץ / פלסטיק לתושבת */}
          <div className="bg-amber-900/40 w-full p-3 rounded-xl border-b-8 border-amber-950 flex flex-wrap justify-center gap-1 shadow-inner min-h-[90px]">
            <Tile value="1" colorClass="text-blue-500" />
            <Tile value="2" colorClass="text-blue-500" />
            <Tile value="5" colorClass="text-red-500" />
            <Tile value="9" colorClass="text-slate-900" />
            <Tile value="9" colorClass="text-amber-500" />
            <Tile value="10" colorClass="text-blue-500" />
            <Tile value="13" colorClass="text-red-500" />
            <Tile isJoker={true} colorClass="text-red-500" />
          </div>
        </div>
      </div>

      {/* --- סרגל פעולות שחקן --- */}
      <div className="bg-slate-950 p-3 border-t border-slate-800 grid grid-cols-4 gap-2">
        <button className="col-span-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold py-3 rounded-lg border border-slate-700 transition-colors flex flex-col items-center justify-center">
          <RefreshCcw className="w-4 h-4 mb-1" /> אחזר
        </button>
        <button onClick={() => setPot(p => p + 50)} className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black py-3 rounded-lg shadow-lg border border-blue-500 transition-colors flex flex-col items-center justify-center">
          <Layers className="w-5 h-5 mb-1 opacity-80" /> שחק סדרה ללוח
        </button>
        <button className="col-span-1 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold py-3 rounded-lg border border-amber-500 transition-colors flex flex-col items-center justify-center shadow-lg shadow-amber-600/20">
          <HandCoins className="w-4 h-4 mb-1" /> שלוף מקופה
        </button>
      </div>
    </div>
  );
}
