// =========================================================
// VeriSess — התראות בתוך האפליקציה + לינק ליומן Google
// =========================================================
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

// יוצר התראה עבור נמען (uid). type: booking | sos | reminder | system
export async function createNotification({ uid, type = 'system', title, body = '', link = '' }) {
  if (!uid || !db) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      uid, type, title, body, link, read: false, createdAt: Date.now(),
    });
  } catch (e) { console.error('[VeriSess] יצירת התראה נכשלה:', e); }
}

// בונה קישור "הוסף ליומן Google" (ללא צורך ב-API/OAuth)
function pad(n) { return String(n).padStart(2, '0'); }
function toGCal(d) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}
export function googleCalendarUrl({ title, startMs, durationMin = 45, details = '' }) {
  const start = new Date(startMs);
  const end = new Date(startMs + durationMin * 60 * 1000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'פגישת VeriSess',
    dates: `${toGCal(start)}/${toGCal(end)}`,
    details: details || 'פגישת וידאו מאובטחת ב-VeriSess',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
