import React, { useState } from 'react';
import { 
  Settings, Shield, Trophy, Users, PlusCircle, 
  Filter, Play, Lock, Crown, ChevronDown, Check, X
} from 'lucide-react';

export default function PokerLobby() {
  const [activeTab, setActiveTab] = useState('cash'); // 'cash' | 'tournament'
  const [showCreateModal, setShowCreateModal] = useState(false);

  // סטייט עבור יצירת שולחן חדש
  const [newTable, setNewTable] = useState({
    name: 'שולחן וי.אי.פי',
    gameType: 'PLO5', // NLH, PLO4, PLO5, PLO6
    blinds: '5/10',
    minBuyIn: 500,
    maxBuyIn: 2000,
    maxPlayers: 6,
    isPrivate: false,
    straddle: true,
    runItTwice: true
  });

  const [tables, setTables] = useState([
    { id: 1, name: "השולחן של עמית", game: "PLO 5", blinds: "5/10", players: "4/6", isPrivate: true, buyin: "₪500-₪2K" },
    { id: 2, name: "High Stakes IL", game: "NL Hold'em", blinds: "50/100", players: "2/9", isPrivate: false, buyin: "₪5K-₪20K" },
    { id: 3, name: "ערב דגים", game: "PLO 4", blinds: "1/2", players: "6/6", isPrivate: false, buyin: "₪100-₪400" },
  ]);

  const handleCreateTable = () => {
    // הוספת השולחן לרשימה (סימולציה)
    const newId = tables.length + 1;
    setTables([...tables, { 
      id: newId, 
      name: newTable.name, 
      game: newTable.gameType, 
      blinds: newTable.blinds, 
      players: `0/${newTable.maxPlayers}`, 
      isPrivate: newTable.isPrivate,
      buyin: `₪${newTable.minBuyIn}-₪${newTable.maxBuyIn}`
    }]);
    setShowCreateModal(false);
  };

  // --- קומפוננטת המודל ליצירת שולחן (Admin Configurator) ---
  const CreateTableModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* כותרת המודל */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg"><Crown className="text-amber-500 w-6 h-6" /></div>
            <div>
              <h2 className="text-2xl font-bold text-white">הגדרת שולחן חדש</h2>
              <p className="text-slate-400 text-sm">הגדר את חוקי המשחק עבור המועדון שלך</p>
            </div>
          </div>
          <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white p-2">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* תוכן ההגדרות */}
        <div className="p-6 space-y-8">
          
          {/* סוג משחק ושם */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-400 text-sm mb-2">שם השולחן</label>
              <input type="text" value={newTable.name} onChange={(e) => setNewTable({...newTable, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">סוג משחק</label>
              <div className="grid grid-cols-4 gap-2">
                {['NLH', 'PLO4', 'PLO5', 'PLO6'].map(type => (
                  <button 
                    key={type} onClick={() => setNewTable({...newTable, gameType: type})}
                    className={`py-3 rounded-xl font-bold text-sm transition-colors border ${newTable.gameType === type ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* בליינדים וכניסה */}
          <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500"/> כלכלה והימורים (Stakes)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1">בליינדים (SB/BB)</label>
                <select value={newTable.blinds} onChange={(e) => setNewTable({...newTable, blinds: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 appearance-none">
                  <option value="1/2">₪1 / ₪2</option>
                  <option value="5/10">₪5 / ₪10</option>
                  <option value="10/20">₪10 / ₪20</option>
                  <option value="50/100">₪50 / ₪100</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">מינימום כניסה (Buy-in)</label>
                <input type="number" value={newTable.minBuyIn} onChange={(e) => setNewTable({...newTable, minBuyIn: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1">מקסימום כניסה</label>
                <input type="number" value={newTable.maxBuyIn} onChange={(e) => setNewTable({...newTable, maxBuyIn: e.target.value})} className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2" />
              </div>
            </div>
          </div>

          {/* חוקים מתקדמים */}
          <div>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-amber-500"/> חוקים מיוחדים</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors">
                <div>
                  <span className="text-white font-medium block">סטראדל (Straddle)</span>
                  <span className="text-slate-400 text-xs">מאפשר לשחקן להכפיל את הבליינד לפני פתיחת הקלפים</span>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={newTable.straddle} onChange={() => setNewTable({...newTable, straddle: !newTable.straddle})} />
                  <div className={`block w-12 h-7 rounded-full transition-colors ${newTable.straddle ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                  <div className={`absolute right-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${newTable.straddle ? 'transform -translate-x-5' : ''}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors">
                <div>
                  <span className="text-white font-medium block">Run it Twice</span>
                  <span className="text-slate-400 text-xs">פתיחת פעמיים ב-All-In כדי להקטין שונות (Variance)</span>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={newTable.runItTwice} onChange={() => setNewTable({...newTable, runItTwice: !newTable.runItTwice})} />
                  <div className={`block w-12 h-7 rounded-full transition-colors ${newTable.runItTwice ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                  <div className={`absolute right-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${newTable.runItTwice ? 'transform -translate-x-5' : ''}`}></div>
                </div>
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <Lock className={`w-5 h-5 ${newTable.isPrivate ? 'text-amber-500' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-white font-medium block">שולחן פרטי (עם סיסמה)</span>
                    <span className="text-slate-400 text-xs">רק שחקנים שמקבלים ממך את הקוד יוכלו להצטרף</span>
                  </div>
                </div>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={newTable.isPrivate} onChange={() => setNewTable({...newTable, isPrivate: !newTable.isPrivate})} />
                  <div className={`block w-12 h-7 rounded-full transition-colors ${newTable.isPrivate ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                  <div className={`absolute right-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${newTable.isPrivate ? 'transform -translate-x-5' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 flex justify-end gap-4 rounded-b-2xl">
          <button onClick={() => setShowCreateModal(false)} className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-colors">
            ביטול
          </button>
          <button onClick={handleCreateTable} className="bg-gradient-to-l from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black px-8 py-3 rounded-xl font-black text-lg flex items-center gap-2 shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all">
            <Play className="w-5 h-5 fill-black" /> פתח שולחן לשחקנים
          </button>
        </div>

      </div>
    </div>
  );

  return (
    <div className="bg-slate-950 text-white p-4 md:p-8 rounded-2xl shadow-2xl min-h-[85vh] flex flex-col font-sans relative" dir="rtl">
      
      {/* הילת רקע יוקרתית */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-2xl h-64 bg-amber-600/10 blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-6 relative z-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-900 border-2 border-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.2)]">
            <Crown className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">CLUB VERISESS</h1>
            <p className="text-slate-400 text-sm font-medium">מועדון סגור | מזהה: #99421</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(217,119,6,0.2)]"
        >
          <PlusCircle className="w-5 h-5" /> צור שולחן חדש
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mb-6 relative z-10 bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-fit">
        <button 
          onClick={() => setActiveTab('cash')}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'cash' ? 'bg-slate-800 text-amber-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
          משחקי קאש (Cash)
        </button>
        <button 
          onClick={() => setActiveTab('tournament')}
          className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'tournament' ? 'bg-slate-800 text-amber-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
          טורנירים (SNG / MTT)
        </button>
      </div>

      {/* Tables List */}
      <div className="flex-1 overflow-y-auto space-y-3 relative z-10">
        {tables.map(table => (
          <div key={table.id} className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between hover:border-amber-500/50 transition-colors group">
            
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-amber-500/30 transition-colors">
                <Users className="text-amber-500 w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white">{table.name}</h3>
                  {table.isPrivate && <Lock className="w-3.5 h-3.5 text-slate-400" title="שולחן פרטי" />}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-400/90 font-mono text-xs border border-slate-700">{table.game}</span>
                  <span>בליינד: <span className="text-white">{table.blinds}</span></span>
                  <span>כניסה: <span className="text-white">{table.buyin}</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-none border-slate-800 pt-4 md:pt-0">
              <div className="text-center">
                <div className="text-xs text-slate-500 mb-1">שחקנים</div>
                <span className="font-mono text-lg text-white">{table.players}</span>
              </div>
              <button className="bg-slate-800 hover:bg-amber-500 hover:text-black text-amber-500 border border-amber-500/30 px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
                הצטרף לשולחן <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm relative z-10 gap-4">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-lg border border-slate-800"><Settings className="w-4 h-4"/> ניהול סוכנים (Agents)</button>
          <button className="flex items-center gap-2 text-amber-500/80 hover:text-amber-400 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20"><Shield className="w-4 h-4"/> בקרת אבטחה (God Mode)</button>
        </div>
        <div className="text-slate-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> שרת RNG פעיל | גרסה 2.1.0
        </div>
      </div>

      {/* טעינת המודל (אם פעיל) */}
      {showCreateModal && <CreateTableModal />}
      
    </div>
  );
}
