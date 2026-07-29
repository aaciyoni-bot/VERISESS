// =========================================================
// VeriSess — Trust & Safety
// =========================================================
// כפתור מצוקה שקט (למטפל בלבד) + ניטור מילות-מפתח בצ'אט → יומן התראות לאדמין.
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

// מילות מפתח בעברית שמעלות דגל בטיחות (סכנה עצמית / אלימות / איום).
export const SAFETY_KEYWORDS = [
  'אובדני', 'אובדנית', 'להתאבד', 'התאבדות', 'לשים סוף', 'לגמור עם החיים',
  'לפגוע בעצמי', 'לחתוך את עצמי', 'לא רוצה לחיות',
  'לרצוח', 'להרוג', 'אהרוג', 'נשק', 'אקדח', 'סכין', 'לדקור',
  'איום', 'לאיים', 'אלימות', 'להכות', 'לפגוע בה', 'לפגוע בו', 'לפגוע בהם',
];

export function scanMessage(text) {
  if (!text) return null;
  const t = String(text);
  for (const kw of SAFETY_KEYWORDS) { if (t.includes(kw)) return kw; }
  return null;
}

// יוצר התראת בטיחות ליומן האדמין.
// type: distress (כפתור מטפל) | keyword (ניטור צ'אט)
export async function createAlert({ type, sessionId, providerId = null, category = null, note = '', keyword = '' }) {
  if (!db) return;
  try {
    await addDoc(collection(db, 'alerts'), {
      type, sessionId: sessionId || null, providerId, category, note, keyword,
      status: 'open', createdAt: Date.now(),
    });
  } catch (e) { console.error('[VeriSess] יצירת התראת בטיחות נכשלה:', e); }
}
