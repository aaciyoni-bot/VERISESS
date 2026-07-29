// =========================================================
// VeriSess — הגדרות סליקה (טרנזילה)
// =========================================================
// שם המסוף (Supplier) בטרנזילה. מוזרק מ-.env בזמן build:
//   VITE_TRANZILA_SUPPLIER=your_terminal_name
// כל עוד לא הוגדר — הצ'קאאוט מציג "סליקה בהקמה" (ולא מזייף הצלחה).

export const TRANZILA_SUPPLIER = import.meta.env.VITE_TRANZILA_SUPPLIER || '';
export const TRANZILA_CONFIGURED = Boolean(TRANZILA_SUPPLIER);

// עמלת הפלטפורמה — הנתח שנשאר אצל VeriSess מכל פגישה.
// המטפל מקבל את היתרה (1 - PLATFORM_FEE). ניתן לשנות במקום אחד.
export const PLATFORM_FEE = 0.15; // 15%
export const providerNet = (gross) => Math.round((Number(gross) || 0) * (1 - PLATFORM_FEE));
export const platformCut = (gross) => Math.round((Number(gross) || 0) * PLATFORM_FEE);

// בונה את כתובת דף הסליקה המתארח של טרנזילה (iframe).
export function buildTranzilaUrl({ sum, description, email, contact, returnUrl }) {
  const params = new URLSearchParams({
    sum: String(sum),
    currency: '1',        // ILS
    cred_type: '1',       // עסקה רגילה
    lang: 'il',
    nologo: '1',
    tranmode: 'A',        // A = חיוב. (לשריון/escrow: J5 — דורש גם גבייה בצד שרת)
  });
  if (description) params.set('pdesc', description);
  if (email) params.set('email', email);
  if (contact) params.set('contact', contact);
  if (returnUrl) {
    params.set('success_url_address', returnUrl);
    params.set('fail_url_address', returnUrl);
  }
  return `https://direct.tranzila.com/${TRANZILA_SUPPLIER}/iframenew.php?${params.toString()}`;
}
