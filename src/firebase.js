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

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// מזהה האתר במשפחה (לשדה siteId בתנועות הארנק)
export const SITE_ID = 'verisess';
export const appId = firebaseConfig.projectId || 'verisess-43aa7';
