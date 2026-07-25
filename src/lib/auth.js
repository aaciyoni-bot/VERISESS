// =========================================================
// VeriSess — עזרי התחברות (Email/Password + Google)
// =========================================================
import {
  GoogleAuthProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updateProfile, signOut, linkWithPopup, EmailAuthProvider, linkWithCredential,
} from 'firebase/auth';
import { auth } from '../firebase.js';

const googleProvider = new GoogleAuthProvider();

// אם המשתמש כרגע אנונימי — משדרגים את אותו החשבון (שומר על ה-uid והנתונים)
export async function signInWithGoogle() {
  const cur = auth.currentUser;
  if (cur && cur.isAnonymous) {
    try { return await linkWithPopup(cur, googleProvider); }
    catch (e) { if (e.code === 'auth/credential-already-in-use') return signInWithPopup(auth, googleProvider); throw e; }
  }
  return signInWithPopup(auth, googleProvider);
}

export async function signUpEmail(email, password, displayName) {
  const cur = auth.currentUser;
  if (cur && cur.isAnonymous) {
    const cred = EmailAuthProvider.credential(email, password);
    const res = await linkWithCredential(cur, cred);
    if (displayName) await updateProfile(res.user, { displayName });
    return res;
  }
  const res = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(res.user, { displayName });
  return res;
}

export function signInEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

// כתובת המנהל (Trust & Safety). ניתן לעדכן בהמשך למספר מנהלים.
export const ADMIN_EMAIL = 'aaci.yoni@gmail.com';
export const isAdminUser = (user) => !!user && user.email === ADMIN_EMAIL;
