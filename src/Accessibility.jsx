import React, { useState, useEffect, useRef } from 'react';
import { Accessibility, X, Plus, Minus, Link2, Type, Contrast, Circle, Pause, RotateCcw, Eye } from 'lucide-react';

const STORAGE_KEY = 'verisess-a11y';
const DEFAULT = { fontScale: 0, filter: 'none', links: false, readable: false, cursor: false, animations: false };

function load() {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return { ...DEFAULT }; }
}

function apply(s) {
  const html = document.documentElement;
  html.style.fontSize = `${100 + s.fontScale * 10}%`;
  html.classList.toggle('a11y-contrast', s.filter === 'contrast');
  html.classList.toggle('a11y-grayscale', s.filter === 'grayscale');
  html.classList.toggle('a11y-invert', s.filter === 'invert');
  html.classList.toggle('a11y-links', s.links);
  html.classList.toggle('a11y-readable', s.readable);
  html.classList.toggle('a11y-cursor', s.cursor);
  html.classList.toggle('a11y-no-animations', s.animations);
}

export default function AccessibilityWidget({ onStatement }) {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState(load);
  const panelRef = useRef(null);

  useEffect(() => { apply(s); localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }, [s]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const set = (patch) => setS((prev) => ({ ...prev, ...patch }));
  const reset = () => setS({ ...DEFAULT });

  const Toggle = ({ active, onClick, icon: Icon, label }) => (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-colors ${active ? 'bg-blue-900 text-white border-blue-900' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
    >
      <Icon className="w-5 h-5" /> {label}
    </button>
  );

  return (
    <>
      {/* כפתור צף */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="פתיחת תפריט נגישות"
        title="נגישות"
        className="fixed bottom-5 left-5 z-[9999] w-14 h-14 rounded-full bg-blue-900 text-white shadow-2xl flex items-center justify-center hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-teal-400/50"
      >
        <Accessibility className="w-7 h-7" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            ref={panelRef}
            role="dialog"
            aria-label="תפריט נגישות"
            dir="rtl"
            className="fixed bottom-24 left-5 z-[9999] w-80 max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold"><Accessibility className="w-5 h-5" /> תפריט נגישות</div>
              <button onClick={() => setOpen(false)} aria-label="סגירה" className="hover:bg-white/10 rounded-lg p-1"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* גודל טקסט */}
              <div>
                <div className="text-xs font-bold text-gray-500 mb-2">גודל טקסט</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => set({ fontScale: Math.max(0, s.fontScale - 1) })} aria-label="הקטנת טקסט" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-100 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                  <span className="w-14 text-center font-bold text-gray-700 text-sm">{100 + s.fontScale * 10}%</span>
                  <button onClick={() => set({ fontScale: Math.min(4, s.fontScale + 1) })} aria-label="הגדלת טקסט" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-100 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                </div>
              </div>

              {/* צבע ותצוגה */}
              <div>
                <div className="text-xs font-bold text-gray-500 mb-2">צבע ותצוגה</div>
                <div className="grid grid-cols-3 gap-2">
                  <Toggle active={s.filter === 'contrast'} onClick={() => set({ filter: s.filter === 'contrast' ? 'none' : 'contrast' })} icon={Contrast} label="ניגודיות" />
                  <Toggle active={s.filter === 'grayscale'} onClick={() => set({ filter: s.filter === 'grayscale' ? 'none' : 'grayscale' })} icon={Circle} label="מונוכרום" />
                  <Toggle active={s.filter === 'invert'} onClick={() => set({ filter: s.filter === 'invert' ? 'none' : 'invert' })} icon={Eye} label="היפוך" />
                </div>
              </div>

              {/* עזרי קריאה */}
              <div>
                <div className="text-xs font-bold text-gray-500 mb-2">עזרי קריאה וניווט</div>
                <div className="grid grid-cols-2 gap-2">
                  <Toggle active={s.links} onClick={() => set({ links: !s.links })} icon={Link2} label="הדגשת קישורים" />
                  <Toggle active={s.readable} onClick={() => set({ readable: !s.readable })} icon={Type} label="פונט קריא" />
                  <Toggle active={s.cursor} onClick={() => set({ cursor: !s.cursor })} icon={Circle} label="סמן גדול" />
                  <Toggle active={s.animations} onClick={() => set({ animations: !s.animations })} icon={Pause} label="עצירת אנימציות" />
                </div>
              </div>

              <button onClick={reset} className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors">
                <RotateCcw className="w-4 h-4" /> איפוס הגדרות
              </button>

              {onStatement && (
                <button onClick={() => { setOpen(false); onStatement(); }} className="w-full text-center text-teal-600 font-bold text-sm hover:underline">
                  להצהרת הנגישות המלאה
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
