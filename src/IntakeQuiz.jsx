import React, { useState } from 'react';
import { Brain, Scale, TrendingUp, Moon, HeartHandshake, Sparkles, GraduationCap, Zap, Clock, Calendar, ChevronRight } from 'lucide-react';

const DOMAINS = [
  { cat: 'psychology', name: 'רגש, חרדה, זוגיות', icon: Brain, color: 'bg-rose-100 text-rose-600' },
  { cat: 'law', name: 'עניין משפטי', icon: Scale, color: 'bg-blue-100 text-blue-600' },
  { cat: 'finance', name: 'כסף וכלכלה', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
  { cat: 'sleep', name: 'שינה והורות', icon: Moon, color: 'bg-indigo-100 text-indigo-600' },
  { cat: 'addiction', name: 'גמילה והתמכרויות', icon: HeartHandshake, color: 'bg-teal-100 text-teal-600' },
  { cat: 'mysticism', name: 'רוחניות ותקשור', icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
  { cat: 'gaming', name: 'חוג / שיעור', icon: GraduationCap, color: 'bg-amber-100 text-amber-600' },
];

const URGENCY = [
  { v: 'now', name: 'עכשיו — דחוף', icon: Zap, color: 'bg-red-100 text-red-600' },
  { v: 'soon', name: 'בימים הקרובים', icon: Clock, color: 'bg-amber-100 text-amber-600' },
  { v: 'flex', name: 'גמיש', icon: Calendar, color: 'bg-gray-100 text-gray-600' },
];

export default function IntakeQuiz({ onDone, onCancel }) {
  const [step, setStep] = useState(1);
  const [cat, setCat] = useState(null);

  return (
    <div dir="rtl" className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden">
        <div className="bg-blue-900 text-white p-6 text-center">
          <h2 className="text-xl font-bold">בוא נמצא לך את המומחה הנכון</h2>
          <p className="text-blue-200 text-xs mt-1">שאלה {step} מתוך 2</p>
        </div>
        <div className="p-6">
          {step === 1 ? (
            <>
              <h3 className="font-bold text-gray-800 mb-4">במה תרצה עזרה?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DOMAINS.map((d) => (
                  <button key={d.cat} onClick={() => { setCat(d.cat); setStep(2); }} className="flex items-center gap-3 bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-300 rounded-xl p-3 transition-colors text-right">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${d.color}`}><d.icon className="w-5 h-5" /></div>
                    <span className="font-bold text-gray-800 text-sm">{d.name}</span>
                  </button>
                ))}
              </div>
              <button onClick={onCancel} className="w-full text-center text-gray-400 text-sm mt-4 hover:text-gray-600">דלג — הצג את כל המומחים</button>
            </>
          ) : (
            <>
              <h3 className="font-bold text-gray-800 mb-4">כמה דחוף?</h3>
              <div className="space-y-2">
                {URGENCY.map((u) => (
                  <button key={u.v} onClick={() => onDone(cat, u.v === 'now')} className="w-full flex items-center gap-3 bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-300 rounded-xl p-4 transition-colors group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${u.color}`}><u.icon className="w-5 h-5" /></div>
                    <span className="font-bold text-gray-800">{u.name}</span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-teal-500 mr-auto" />
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} className="w-full text-center text-gray-400 text-sm mt-4 hover:text-gray-600">חזרה</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
