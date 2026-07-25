# VeriSess

מרקטפלייס ישראלי לפגישות וידאו מוגנות עם מומחים מאומתים — פסיכולוגים, עורכי דין,
יועצים פיננסיים, מדריכות הנקה, מנטורי סטארטאפ ועוד. *זמן פנוי של מומחה = כסף;
נגישות + הנחה ללקוח.*

## מודל התשלום — כפול, במקביל

1. **סליקת אשראי מהירה (Stripe)** — שריון ידני + capture בסוף הפגישה. `backend/server.js`.
2. **ארנק טוקנים (VeriPoints)** — 1 טוקן = 1 ₪. שריון/גבייה-עם-פיצול/שחרור על גבי
   Firestore. `src/lib/wallet.js`. עמלות: 20% מתוזמנת · 30% SOS · 20% דיל · 15% קבוצתי.

## סטאק

- **React 18 + Vite** (frontend), Tailwind CSS, lucide-react.
- **Firebase** (Auth + Firestore + Storage), פרויקט אחד: `verisess-43aa7`.
- **Node/Express** backend ל-Stripe + Twilio.

## הרצה מקומית

```bash
# Frontend
npm install
cp .env.example .env      # מלא ערכי Firebase
npm run dev               # http://localhost:5173

# Backend (בטרמינל נפרד)
cd backend
npm install
cp .env.example .env      # מלא STRIPE_SECRET_KEY וכו'
npm run dev               # http://localhost:3001
```

> Windows PowerShell: השתמש ב-`Copy-Item .env.example .env` במקום `cp`.

## מבנה

```
├── index.html              נקודת כניסה (Vite)
├── src/
│   ├── main.jsx            bootstrap של React
│   ├── App.jsx             האפליקציה + הנתב (כרגע כולל דמו משולב)
│   ├── firebase.js         אתחול Firebase מרוכז
│   ├── index.css           Tailwind
│   ├── lib/wallet.js       מנוע הארנק (חוזה הטוקנים)
│   └── *.jsx               טיוטות קומפוננטות נפרדות (עדיין לא מחוברות ל-App)
├── backend/server.js       Stripe + Twilio
├── SETUP-FIREBASE.md       שירותים + חוקי אבטחה (חובה)
└── README.md
```

## סטטוס ומפת דרכים

הוקמה תשתית build + Firebase + מנוע ארנק הטוקנים + חוקי אבטחה + הוצאת מפתח Stripe
לסביבה. השלבים הבאים: טאב "כלכלה" באדמין, פרופיל מומחה עשיר, סוגי חדרים ייעודיים,
וידאו LiveKit בין שני משתמשים, יומן/זמינות אמיתיים, התראות, ומעבר פעולות רגישות
ל-Cloud Functions לפני השקה ציבורית.

## אבטחה

- סודות (מפתחות Stripe/Twilio) אך ורק ב-`.env` — לא בגיט.
- `apiKey` של Firebase ציבורי במכוון (מוגן ע"י חוקי Firestore).
- פעולות הארנק רצות מהדפדפן **בפיילוט בלבד**; לפני פרודקשן עוברות ל-Cloud Functions.
