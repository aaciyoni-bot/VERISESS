// =========================================================
// VeriSess — שכבת הענן (Firebase)
// פרויקט Firebase אחד לכל משפחת האתרים: verisess-43aa7 (SSO משותף)
// =========================================================
// הערה על אבטחה: apiKey של Firebase הוא מזהה ציבורי במכוון ואינו סוד —
// ההגנה האמיתית היא חוקי האבטחה של Firestore (ראה SETUP-FIREBASE.md).
// עם זאת, כל הערכים מוזרקים מקובץ .env כדי לא לקבע קונפיגורציה בקוד.
// ראה .env.example.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// אתחול מוגן: אם חסרה קונפיגורציה (למשל בתצוגת דמו ללא .env), לא מפילים
// את האפליקציה — פשוט מדלגים על אתחול Firebase. הפעולות שנשענות עליו
// ייכשלו רק אם ייקראו בפועל, אך מסכי הדמו ירונדרו כרגיל.
const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = hasConfig ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

if (!hasConfig) {
  console.warn('[VeriSess] Firebase לא אותחל — חסרים משתני VITE_FIREBASE_* ב-.env. מצב דמו.');
}

// מזהה האתר במשפחה (לשדה siteId בתנועות הארנק)
export const SITE_ID = 'verisess';
export const appId = firebaseConfig.projectId || 'verisess-43aa7';
