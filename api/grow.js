// =========================================================
// VeriSess — יצירת תהליך תשלום ב-GROW (משולם) · Vercel Serverless
// =========================================================
// מחזיק את מפתחות GROW בצד השרת בלבד (env), ויוצר תהליך תשלום מאובטח.
// משתני סביבה נדרשים (ב-Vercel → Settings → Environment Variables):
//   GROW_PAGE_CODE, GROW_USER_ID, GROW_API_KEY
// אופציונלי: GROW_ENV=sandbox (ברירת מחדל: production)
//
// זרימה: הלקוח קורא POST /api/grow עם {sum, description, successUrl, cancelUrl}
//   → מקבל {url} → מפנים אליו את הלקוח לדף התשלום המאובטח של GROW.

const BASE = {
  production: 'https://secure.meshulam.co.il/api/light/server/1.0',
  sandbox: 'https://sandbox.meshulam.co.il/api/light/server/1.0',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method-not-allowed' });
    return;
  }

  const pageCode = process.env.GROW_PAGE_CODE;
  const userId = process.env.GROW_USER_ID;
  const apiKey = process.env.GROW_API_KEY;
  const base = BASE[process.env.GROW_ENV === 'sandbox' ? 'sandbox' : 'production'];

  if (!pageCode || !userId || !apiKey) {
    res.status(200).json({ ok: false, configured: false, error: 'GROW טרם הוגדר (חסרים GROW_PAGE_CODE/USER_ID/API_KEY)' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const sum = Number(body.sum);
    if (!(sum > 0)) { res.status(400).json({ ok: false, error: 'sum-invalid' }); return; }

    const form = new URLSearchParams({
      pageCode,
      userId,
      apiKey,
      sum: String(sum),
      description: body.description || 'פגישת VeriSess',
      paymentNum: '1',
      maxPaymentNum: '1',
      successUrl: body.successUrl || '',
      cancelUrl: body.cancelUrl || body.successUrl || '',
      // ניתן להוסיף notifyUrl (webhook שרת-לשרת) בהמשך לאימות מאובטח
      cField1: body.reference || '',
    });

    const r = await fetch(`${base}/createPaymentProcess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
    const data = await r.json();

    // GROW מחזיר { status: 1, data: { url, processId, processToken } } בהצלחה
    const url = data?.data?.url;
    if (data?.status === 1 && url) {
      res.status(200).json({ ok: true, url, processId: data.data.processId || null });
    } else {
      res.status(200).json({ ok: false, error: data?.err?.message || data?.message || 'grow-error', raw: data });
    }
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
