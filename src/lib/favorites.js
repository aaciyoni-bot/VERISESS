// =========================================================
// VeriSess — מועדפים (מטפלים שמורים)
// =========================================================
import { doc, onSnapshot, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase.js';

export function subscribeFavorites(uid, cb) {
  if (!uid || !db) { cb([]); return () => {}; }
  return onSnapshot(doc(db, 'favorites', uid), (s) => {
    cb(s.exists() ? (s.data().providerIds || []) : []);
  }, () => cb([]));
}

export async function toggleFavorite(uid, providerId, currentlyFav) {
  if (!uid || !db || !providerId) return;
  await setDoc(
    doc(db, 'favorites', uid),
    { providerIds: currentlyFav ? arrayRemove(providerId) : arrayUnion(providerId) },
    { merge: true },
  );
}
