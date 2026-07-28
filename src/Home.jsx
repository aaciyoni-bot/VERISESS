import React from 'react';
import {
  ShieldCheck, Lock, Video, Zap, Search, UserCheck, CreditCard, Clock,
  Brain, Scale, Moon, HeartHandshake, Coins, Sparkles, GraduationCap, TrendingUp,
  ChevronLeft, Star,
} from 'lucide-react';

const CATEGORIES = [
  { icon: Brain, name: 'פסיכולוגיה ורגש', color: 'text-rose-500 bg-rose-50' },
  { icon: Scale, name: 'משפט ועריכת דין', color: 'text-blue-500 bg-blue-50' },
  { icon: TrendingUp, name: 'ייעוץ פיננסי', color: 'text-emerald-500 bg-emerald-50' },
  { icon: Moon, name: 'שינה והורות', color: 'text-indigo-500 bg-indigo-50' },
  { icon: HeartHandshake, name: 'גמילה וליווי', color: 'text-teal-500 bg-teal-50' },
  { icon: Sparkles, name: 'רוחניות ותקשור', color: 'text-purple-500 bg-purple-50' },
  { icon: GraduationCap, name: 'שיעורים וחוגים', color: 'text-amber-500 bg-amber-50' },
  { icon: Coins, name: 'מנטורינג ועסקים', color: 'text-cyan-500 bg-cyan-50' },
];

const STEPS = [
  { icon: Search, title: 'מוצאים מומחה', text: 'סינון לפי תחום, זמינות ומחיר. כל מומחה עובר אימות זהות (KYC).' },
  { icon: CreditCard, title: 'משלמים בבטחה', text: 'סליקה מוצפנת. הכסף מוגן עד סיום הפגישה — בלי סיכון.' },
  { icon: Video, title: 'נכנסים לשיחה', text: 'וידאו מוצפן מקצה לקצה, ישירות בדפדפן. בלי הורדות, בלי טרחה.' },
];

export default function Home({ onFindExpert, onProviderSignup }) {
  return (
    <div dir="rtl" className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-900 to-gray-900 text-white">
        <div className="absolute top-0 left-0 opacity-[0.06] pointer-events-none"><ShieldCheck className="w-[32rem] h-[32rem] -mt-20 -ml-20" /></div>
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-24 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-teal-200 mb-6">
            <Lock className="w-3.5 h-3.5" /> מוצפן מקצה לקצה · מומחים מאומתים
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-tight">
            המומחה שאתה צריך.<br /><span className="text-teal-400">בשיחת וידאו. עכשיו.</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto mb-10">
            פסיכולוגים, עורכי דין, יועצים ומורים מאומתים — פגישת וידאו מאובטחת בתוך דקות,
            או שיחת SOS מיידית כשצריך עכשיו.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onFindExpert} className="bg-teal-500 hover:bg-teal-400 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-teal-500/20 transition-colors flex items-center justify-center gap-2">
              <Search className="w-5 h-5" /> מצא מומחה
            </button>
            <button onClick={onProviderSignup} className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-colors">
              אני מומחה — הצטרפות
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-12 text-sm text-blue-200">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-teal-400" /> אימות זהות למומחים</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-teal-400" /> זמינות SOS 24/7</span>
            <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-teal-400" /> פרטיות מלאה</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3">איך זה עובד?</h2>
        <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">שלושה צעדים מהרגע שהחלטת ועד שאתה בשיחה.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <div key={i} className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <div className="absolute -top-4 right-8 bg-blue-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{i + 1}</div>
              <div className="bg-teal-100 text-teal-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-5"><s.icon className="w-7 h-7" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-500 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3">תחומי מומחיות</h2>
          <p className="text-gray-500 text-center mb-14">12 זירות ומעל 90 קטגוריות — יש מומחה לכל צורך.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((c, i) => (
              <button key={i} onClick={onFindExpert} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all text-right group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.color}`}><c.icon className="w-6 h-6" /></div>
                <div className="font-bold text-gray-800 group-hover:text-teal-600 transition-colors">{c.name}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Lock, title: 'הצפנה מקצה לקצה', text: 'השיחות והצ׳אט מוצפנים. אף אחד — כולל אנחנו — לא נכנס לפגישה שלך.' },
            { icon: UserCheck, title: 'מומחים מאומתים', text: 'כל מומחה עובר אימות זהות ובדיקת רישיון לפני שהוא מופיע בקטלוג.' },
            { icon: ShieldCheck, title: 'תשלום מוגן', text: 'הכסף נשמר בבטחה ומשוחרר רק לאחר שקיבלת את השירות.' },
          ].map((t, i) => (
            <div key={i} className="text-center px-4">
              <div className="bg-blue-900 text-teal-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"><t.icon className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.title}</h3>
              <p className="text-gray-500 leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-gradient-to-l from-teal-500 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">מוכן להתחיל?</h2>
          <p className="text-teal-50 text-lg mb-8">מצא את המומחה הנכון תוך דקות — בבית, בפרטיות מלאה.</p>
          <button onClick={onFindExpert} className="bg-white text-teal-700 font-bold text-lg px-10 py-4 rounded-2xl shadow-xl hover:bg-gray-50 transition-colors inline-flex items-center gap-2">
            מצא מומחה עכשיו <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
