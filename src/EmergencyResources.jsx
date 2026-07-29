import React, { useState, useEffect } from 'react';
import { LifeBuoy, X, Phone, Globe } from 'lucide-react';

const LINES = [
  { name: 'ער"ן — עזרה ראשונה נפשית', num: '1201', tel: '1201', note: '24/7, אנונימי וחינם' },
  { name: 'מוקד חירום — מד"א', num: '101', tel: '101', note: 'סכנת חיים / חירום רפואי' },
  { name: 'נט"ל — טראומה ומצוקה', num: '1-800-363-363', tel: '1800363363', note: 'תמיכה נפשית' },
  { name: 'משטרה', num: '100', tel: '100', note: 'סכנה מיידית' },
];

export default function EmergencyResources() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="עזרה מיידית ומוקדי חירום"
        title="עזרה מיידית"
        className="fixed bottom-5 right-5 z-[9998] flex items-center gap-2 bg-red-600 text-white shadow-2xl rounded-full pr-4 pl-3 py-2.5 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
      >
        <LifeBuoy className="w-5 h-5" /> <span className="font-bold text-sm">עזרה מיידית</span>
      </button>

      {open && (
        <div dir="rtl" className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-red-600 text-white px-5 py-4 flex items-center justify-between">
              <span className="font-bold flex items-center gap-2"><LifeBuoy className="w-5 h-5" /> מוקדי סיוע וחירום</span>
              <button onClick={() => setOpen(false)} aria-label="סגירה"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5">
              <p className="text-gray-600 text-sm mb-4">אם אתה או מישהו בסביבתך במצוקה או בסכנה — אל תישאר לבד. פנה עכשיו:</p>
              <div className="space-y-2">
                {LINES.map((l) => (
                  <a key={l.num} href={`tel:${l.tel}`} className="flex items-center gap-3 bg-gray-50 hover:bg-red-50 border border-gray-100 rounded-xl p-3 transition-colors">
                    <div className="bg-red-100 text-red-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0"><Phone className="w-5 h-5" /></div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-800">{l.name}</div>
                      <div className="text-gray-500 text-xs">{l.note}</div>
                    </div>
                    <div className="mr-auto font-black text-red-600 text-lg shrink-0" dir="ltr">{l.num}</div>
                  </a>
                ))}
              </div>
              <a href="https://www.eran.org.il/" target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 text-teal-600 text-sm font-bold hover:underline">
                <Globe className="w-4 h-4" /> צ׳אט סיוע מקוון (ער"ן)
              </a>
              <p className="text-gray-400 text-xs text-center mt-4">VeriSess אינה שירות חירום. במצב סכנה חייגו 101 / 100.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
