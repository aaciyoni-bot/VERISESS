import React from 'react';
import { ShieldCheck, Mail, MessageCircle, Accessibility } from 'lucide-react';

const UPDATED = 'יולי 2026';

function Page({ title, children }) {
  return (
    <div dir="rtl" className="min-h-[70vh] bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">{title}</h1>
          <p className="text-gray-400 text-sm mb-8">עודכן לאחרונה: {UPDATED}</p>
          <div className="space-y-5 text-gray-700 leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}
const H = ({ children }) => <h2 className="text-lg font-bold text-gray-900 mt-6">{children}</h2>;
const P = ({ children }) => <p className="text-gray-600">{children}</p>;

export function Terms() {
  return (
    <Page title="תנאי שימוש">
      <P>ברוכים הבאים ל-VeriSess ("השירות"). השימוש בשירות מהווה הסכמה לתנאים אלה. אם אינך מסכים — אין לעשות שימוש בשירות.</P>
      <H>מהות השירות</H>
      <P>VeriSess היא פלטפורמת תיווך המחברת בין לקוחות למומחים עצמאיים לצורך פגישות וידאו. VeriSess אינה צד למתן השירות המקצועי עצמו ואינה אחראית לתוכנו, לאיכותו או לתוצאותיו.</P>
      <H>אחריות המומחים</H>
      <P>המומחים הם ספקים עצמאיים האחראים בלעדית לשירות שהם מעניקים, לרישיונותיהם ולעמידתם בכל דין. VeriSess מבצעת אימות זהות בסיסי אך אינה ערבה למקצועיותם.</P>
      <H>תשלומים</H>
      <P>התשלום מתבצע דרך ספק סליקה מאובטח. הסכום עשוי להישמר בנאמנות עד לסיום הפגישה. מדיניות ביטולים והחזרים תוצג בעת ההזמנה.</P>
      <H>שימוש הולם</H>
      <P>אין להשתמש בשירות למטרות בלתי חוקיות, פוגעניות, או להטרדה. חל איסור על הימורים בכסף אמיתי, תוכן מיני או מתן ייעוץ רפואי מסוכן. זירת המשחקים מוגבלת לחוגים חברתיים בצ׳יפים וירטואליים בלבד.</P>
      <H>הגבלת אחריות</H>
      <P>השירות ניתן כמות שהוא (AS-IS). VeriSess לא תישא באחריות לנזק ישיר או עקיף הנובע מהשימוש בשירות או מהשירות המקצועי שהתקבל דרכו.</P>
      <H>שינויים</H>
      <P>אנו רשאים לעדכן תנאים אלה מעת לעת. המשך שימוש לאחר עדכון מהווה הסכמה לתנאים המעודכנים.</P>
    </Page>
  );
}

export function Privacy() {
  return (
    <Page title="מדיניות פרטיות">
      <P>אנו מכבדים את פרטיותך. מסמך זה מסביר אילו נתונים אנו אוספים וכיצד אנו שומרים עליהם.</P>
      <H>מידע שאנו אוספים</H>
      <P>פרטי חשבון (אימייל, שם), פרטי פגישות והזמנות, ותוכן תפעולי הדרוש להפעלת השירות. שיחות הווידאו מוצפנות מקצה לקצה ואינן מוקלטות או נצפות על ידינו.</P>
      <H>שימוש במידע</H>
      <P>המידע משמש להפעלת השירות, אימות זהות, עיבוד תשלומים ותמיכה. איננו מוכרים מידע אישי לצדדים שלישיים.</P>
      <H>אחסון ואבטחה</H>
      <P>הנתונים נשמרים בשרתי ענן מאובטחים (Google Firebase) עם הצפנה והרשאות גישה מוגבלות. פרטי אשראי מעובדים אך ורק אצל ספק הסליקה המוסמך ואינם נשמרים אצלנו.</P>
      <H>זכויותיך</H>
      <P>ניתן לעיין, לתקן או למחוק את המידע שלך בפנייה אלינו. נטפל בכל בקשה בהתאם לחוק הגנת הפרטיות.</P>
      <H>עוגיות</H>
      <P>אנו עושים שימוש מינימלי בעוגיות הכרחיות בלבד לצורך התחברות ותפעול השירות.</P>
    </Page>
  );
}

export function AccessibilityPage() {
  return (
    <Page title="הצהרת נגישות">
      <div className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl p-4">
        <Accessibility className="w-8 h-8 text-teal-600 shrink-0" />
        <P>VeriSess מחויבת להנגשת השירות לאנשים עם מוגבלות, בהתאם לתקן הישראלי <b>ת"י 5568</b> ולהנחיות <b>WCAG 2.1 ברמה AA</b>.</P>
      </div>
      <H>מה הונגש</H>
      <P>ניווט מלא במקלדת, ניגודיות צבעים תקינה, תמיכה בקוראי מסך, טקסט חלופי לתמונות, מבנה כותרות סמנטי, וכיווניות RTL מלאה בעברית.</P>
      <H>מגבלות ידועות</H>
      <P>ייתכנו רכיבים בפיתוח מתמשך שטרם הונגשו במלואם. אנו פועלים לתיקון שוטף.</P>
      <H>פנייה בנושא נגישות</H>
      <P>נתקלת בבעיית נגישות? נשמח לסייע ולתקן. פנה אלינו בדוא"ל: <a className="text-teal-600 font-bold" href="mailto:support@verisess.com">support@verisess.com</a>.</P>
    </Page>
  );
}

export function Contact() {
  return (
    <Page title="צור קשר">
      <P>נשמח לעמוד לרשותך בכל שאלה, בקשה או תקלה.</P>
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <a href="mailto:support@verisess.com" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl p-5 transition-colors">
          <div className="bg-blue-100 text-blue-700 w-11 h-11 rounded-xl flex items-center justify-center"><Mail className="w-5 h-5" /></div>
          <div><div className="font-bold text-gray-800">אימייל</div><div className="text-gray-500 text-sm">support@verisess.com</div></div>
        </a>
        <a href="https://wa.me/" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl p-5 transition-colors">
          <div className="bg-green-100 text-green-600 w-11 h-11 rounded-xl flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
          <div><div className="font-bold text-gray-800">וואטסאפ</div><div className="text-gray-500 text-sm">תמיכה מהירה</div></div>
        </a>
      </div>
      <P>זמני מענה: ימים א׳–ה׳, 09:00–18:00.</P>
    </Page>
  );
}

export function Footer({ onNav }) {
  const link = (view, label) => (
    <button onClick={() => onNav(view)} className="text-gray-400 hover:text-white transition-colors text-sm text-right">{label}</button>
  );
  return (
    <footer dir="rtl" className="bg-gray-900 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-7 h-7 text-teal-400" />
            <span className="text-xl font-bold">Veri<span className="text-teal-400">Sess</span></span>
          </div>
          <p className="text-gray-400 text-sm max-w-sm">מרקטפלייס ישראלי לפגישות וידאו מוגנות עם מומחים מאומתים. פרטיות, אבטחה ונגישות — בליבת השירות.</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="font-bold text-sm mb-1">מידע</div>
          {link('terms', 'תנאי שימוש')}
          {link('privacy', 'מדיניות פרטיות')}
          {link('accessibility', 'הצהרת נגישות')}
        </div>
        <div className="flex flex-col gap-2">
          <div className="font-bold text-sm mb-1">תמיכה</div>
          {link('contact', 'צור קשר')}
          {link('marketplace', 'מצא מומחה')}
          {link('onboarding', 'הצטרפות כמומחה')}
        </div>
      </div>
      <div className="border-t border-gray-800 py-5 text-center text-gray-500 text-xs">
        © {new Date().getFullYear()} VeriSess · כל הזכויות שמורות
      </div>
    </footer>
  );
}
