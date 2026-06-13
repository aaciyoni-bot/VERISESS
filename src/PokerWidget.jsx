import React, { useState, useEffect } from 'react';
import { Coins, Eye, EyeOff, Users, Play, RefreshCw } from 'lucide-react';

// ==========================================
// 1. מנוע הקלפים (Card Engine)
// ==========================================
const SUITS = { 
  hearts: { symbol: '♥️', color: 'text-red-600' }, 
  diamonds: { symbol: '♦️', color: 'text-red-600' }, 
  clubs: { symbol: '♣️', color: 'text-black' }, 
  spades: { symbol: '♠️', color: 'text-black' } 
};
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const generateDeck = () => {
  let deck = [];
  for (let suit in SUITS) {
    for (let value of VALUES) {
      deck.push({ suit, value, ...SUITS[suit] });
    }
  }
  // ערבוב (Fisher-Yates Shuffle)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// ==========================================
// 2. ווידג'ט הפוקר הראשי
// ==========================================
export default function PokerWidget() {
  const [gameState, setGameState] = useState('idle'); // idle, preflop, flop, turn, river, showdown
  const [deck, setDeck] = useState([]);
  const [pot, setPot] = useState(0);
  
  // קלפים
  const [myHand, setMyHand] = useState([]);
  const [opponentHand, setOpponentHand] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  
  // *** הפיצ'ר החשוב של המנכ"ל: מצב "אלוהים" לאדמין ***
  const [adminGodMode, setAdminGodMode] = useState(false);

  // התחלת יד חדשה
  const dealNewHand = () => {
    const newDeck = generateDeck();
    setMyHand([newDeck.pop(), newDeck.pop()]);
    setOpponentHand([newDeck.pop(), newDeck.pop()]);
    
    // קלפי קהילה (מוסתרים בהתחלה)
    setCommunityCards([
      newDeck.pop(), newDeck.pop(), newDeck.pop(), // Flop
      newDeck.pop(), // Turn
      newDeck.pop()  // River
    ]);
    
    setDeck(newDeck);
    setPot(100); // בליינדים אוטומטיים
    setGameState('preflop');
  };

  // התקדמות בשלבי המשחק
  const nextStage = () => {
    if (gameState === 'preflop') setGameState('flop');
    else if (gameState === 'flop') setGameState('turn');
    else if (gameState === 'turn') setGameState('river');
    else if (gameState === 'river') setGameState('showdown');
    else if (gameState === 'showdown') dealNewHand();
  };

  // כפתור הימור
  const placeBet = (amount) => {
    setPot(prev => prev + amount);
    // אחרי הימור, היריב משווה (סימולציה) ואז מתקדמים
    setTimeout(() => {
      setPot(prev => prev + amount); // היריב משווה
      nextStage();
    }, 800);
  };

  // רכיב גרפי של קלף
  const Card = ({ card, hidden, className = "" }) => {
    if (hidden && !adminGodMode) {
      return (
        <div className={`w-16 h-24 bg-blue-900 border-2 border-white rounded-lg shadow-md flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] ${className}`}>
          <div className="w-12 h-20 border border-blue-400 rounded opacity-50"></div>
        </div>
      );
    }
    return (
      <div className={`w-16 h-24 bg-white border border-gray-300 rounded-lg shadow-md flex flex-col justify-between p-1 ${card.color} ${className} ${hidden && adminGodMode ? 'ring-4 ring-yellow-400' : ''}`}>
        <div className="text-sm font-bold leading-none">{card.value}</div>
        <div className="text-2xl text-center">{card.symbol}</div>
        <div className="text-sm font-bold leading-none text-right rotate-180">{card.value}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl relative select-none">
      
      {/* תפריט עליון (כולל God Mode למנהל) */}
      <div className="bg-black/50 p-3 flex justify-between items-center text-white border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="font-bold text-yellow-400 text-lg">קופה: ₪{pot}</span>
        </div>
        
        {/* כפתור זה יופיע בפרודקשן רק אם המשתמש הוא מנהל T&S */}
        <button 
          onClick={() => setAdminGodMode(!adminGodMode)}
          className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${adminGodMode ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          title="T&S Admin Override"
        >
          {adminGodMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          God Mode
        </button>
      </div>

      {/* שולחן הפוקר (The Felt) */}
      <div className="flex-1 bg-green-800 relative p-4 flex flex-col justify-between" style={{ backgroundImage: "radial-gradient(circle, #166534 0%, #064e3b 100%)" }}>
        
        {/* אזור יריב (למעלה) */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {gameState === 'idle' ? (
              <div className="w-32 h-24 border-2 border-dashed border-green-600 rounded-lg flex items-center justify-center text-green-700 font-bold">ממתין...</div>
            ) : (
              <>
                <Card card={opponentHand[0]} hidden={gameState !== 'showdown'} className="transform -rotate-6" />
                <Card card={opponentHand[1]} hidden={gameState !== 'showdown'} className="transform rotate-6 -ml-4" />
              </>
            )}
          </div>
          <div className="bg-black/40 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
            <Users className="w-3 h-3" /> שחקן 2 (אורח)
            {adminGodMode && gameState !== 'showdown' && gameState !== 'idle' && <span className="text-yellow-400 font-bold ml-1">חשוף לאדמין</span>}
          </div>
        </div>

        {/* קלפי קהילה (אמצע) */}
        <div className="flex justify-center gap-2 my-8">
          {gameState === 'idle' && (
             <div className="text-green-600/50 font-bold text-2xl tracking-widest uppercase">TEXAS HOLD'EM</div>
          )}
          
          {gameState !== 'idle' && (
            <>
              {/* Flop */}
              <Card card={communityCards[0]} hidden={gameState === 'preflop'} />
              <Card card={communityCards[1]} hidden={gameState === 'preflop'} />
              <Card card={communityCards[2]} hidden={gameState === 'preflop'} />
              {/* Turn */}
              <Card card={communityCards[3]} hidden={gameState === 'preflop' || gameState === 'flop'} />
              {/* River */}
              <Card card={communityCards[4]} hidden={gameState !== 'river' && gameState !== 'showdown'} />
            </>
          )}
        </div>

        {/* האזור שלי (למטה) */}
        <div className="flex flex-col items-center gap-2">
          <div className="bg-black/40 text-white text-xs px-3 py-1 rounded-full">
            היד שלך
          </div>
          <div className="flex gap-2">
            {gameState === 'idle' ? (
              <div className="w-32 h-24 border-2 border-dashed border-green-600 rounded-lg"></div>
            ) : (
              <>
                <Card card={myHand[0]} hidden={false} className="transform -rotate-6 hover:-translate-y-2 transition-transform cursor-pointer" />
                <Card card={myHand[1]} hidden={false} className="transform rotate-6 -ml-4 hover:-translate-y-2 transition-transform cursor-pointer" />
              </>
            )}
          </div>
        </div>

      </div>

      {/* פאנל פעולות (Action Bar) */}
      <div className="bg-gray-900 p-4 border-t border-gray-800">
        {gameState === 'idle' || gameState === 'showdown' ? (
          <button 
            onClick={dealNewHand}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 shadow-lg"
          >
            {gameState === 'showdown' ? <RefreshCw className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {gameState === 'showdown' ? 'יד חדשה' : 'חלק קלפים לתחילת משחק'}
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <button className="bg-red-900/50 text-red-500 hover:bg-red-900 text-sm font-bold py-3 rounded-lg border border-red-900">
              Fold
            </button>
            <button onClick={() => placeBet(0)} className="bg-blue-900/50 text-blue-400 hover:bg-blue-900 text-sm font-bold py-3 rounded-lg border border-blue-900">
              Check
            </button>
            <button onClick={() => placeBet(50)} className="bg-yellow-600 hover:bg-yellow-500 text-black text-sm font-bold py-3 rounded-lg shadow-lg">
              Raise ₪50
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
