// =========================================================
// VeriSess — שכבת הענן (Firebase)
// פרויקט Firebase אחד לכל משפחת האתרים: verisess-43aa7 (SSO משותף)
// =========================================================
// הערה על אבטחה: apiKey של Firebase הוא מזהה ציבורי במכוון ואינו סוד —
// ההגנה האמיתית היא חוקי האבטחה של Firestore (ראה SETUP-FIREBASE.md).
// לכן מותר לקבע אותו בקוד. ניתן לעקוף כל ערך דרך משתני VITE_FIREBASE_* ב-.env.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// קונפיג אמיתי של פרויקט verisess-43aa7 (ציבורי, מוגן ע"י חוקי Firestore).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD8z_m36YVndBTX3_Zds6grTsK8vNL1evA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'verisess-43aa7.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'verisess-43aa7',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'verisess-43aa7.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '795504912463',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:795504912463:web:5104b04ff5ca48c597a23a',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// מזהה האתר במשפחה (לשדה siteId בתנועות הארנק)
export const SITE_ID = 'verisess';
export const appId = firebaseConfig.projectId || 'verisess-43aa7';
