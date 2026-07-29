import React from 'react';
import { ShieldCheck, X, Printer } from 'lucide-react';

export default function Receipt({ booking, onClose }) {
  if (!booking) return null;
  const date = (() => { try { return new Date(booking.createdAt).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return ''; } })();
  const method = booking.tranzila ? 'כרטיס אשראי (טרנזילה)' : 'סליקה מקוונת';
  const ref = booking.id?.slice(-8)?.toUpperCase() || '—';

  return (
    <div dir="rtl" className="fixed inset-0 bg-black/50 z-[9990] flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="print-area bg-white rounded-2xl shadow-2xl max-w-md w-full my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 no-print">
          <span className="font-bold text-gray-700">אישור תשלום</span>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><Printer className="w-4 h-4" /> הדפס / PDF</button>
            <button onClick={onClose} aria-label="סגירה" className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-8 h-8 text-blue-900" />
            <span className="text-2xl font-bold text-blue-900">Veri<span className="text-teal-500">Sess</span></span>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">אישור תשלום</h1>
          <p className="text-gray-400 text-sm mb-6">מס׳ אסמכתא: {ref}</p>

          <div className="space-y-3 text-sm">
            <Row label="תאריך" value={date} />
            <Row label="שירות" value={`פגישת וידאו${booking.sessionType === 'sos' ? ' (SOS)' : ''}`} />
            <Row label="מומחה" value={booking.providerName || '—'} />
            <Row label="לקוח" value={booking.anonymous ? 'לקוח אנונימי' : (booking.clientEmail || booking.clientDisplay || '—')} />
            <Row label="אמצעי תשלום" value={method} />
            <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
              <span className="font-bold text-gray-800">סה״כ שולם</span>
              <span className="font-black text-2xl text-blue-900">₪{booking.amount}</span>
            </div>
          </div>

          <p className="text-gray-400 text-xs mt-8 leading-relaxed border-t border-gray-100 pt-4">
            מסמך זה הוא אישור על ביצוע תשלום דרך פלטפורמת VeriSess ואינו מהווה חשבונית מס/קבלה רשמית לצורכי מס.
            קבלה/חשבונית מס רשמית מונפקת בנפרד ע״י נותן השירות או חברת הסליקה, בהתאם לדין.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold text-gray-800">{value}</span>
    </div>
  );
}
