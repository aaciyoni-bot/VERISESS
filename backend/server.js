// =========================================================
// VeriSess Backend Server - מנוע כספים והתראות SMS
// =========================================================
// דורש התקנת ספריות: npm install express cors stripe twilio dotenv
const express = require('express');
const cors = require('cors');

// אתחול מנוע הסליקה (Stripe)
// בפרודקשן נשתמש ב-process.env.STRIPE_SECRET_KEY כדי לא לחשוף את המפתח בקוד
const stripe = require('stripe')('sk_test_51ThmvWQVqEdHngCF2DRmIPVYtspJ30Lqeylw6LjtdQHgNUqTpGu0PsaXqJM0fX96H59EQAPH5XDI6e96sErznobL00eomIUzuc');

// אתחול מנוע ה-SMS (Twilio) 
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'AC_YOUR_TWILIO_SID_HERE'; 
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'YOUR_TWILIO_AUTH_TOKEN_HERE';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890'; 

// בפרודקשן הורידו את ההערה כדי להפעיל את הקליינט:
// const twilioClient = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const app = express();

// הגדרות אבטחה בסיסיות (Middlewares)
app.use(cors({ origin: true })); // בפרודקשן, נגביל את ה-origin רק לדומיין של VeriSess
app.use(express.json());

// =========================================================
// נתיב 1: שריון כספים מלקוח (Create Payment Intent)
// מופעל כשהלקוח לוחץ "אשר הפקדה" בקופה (ClientCheckout.jsx)
// =========================================================
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { amount, expertId, clientId } = req.body;

    // יוצרים כוונת תשלום מול חברת האשראי
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe מחשב באגורות/סנטים, אז מכפילים ב-100
      currency: 'ils', // שקל חדש
      capture_method: 'manual', // שריון מסגרת בלבד! הכסף לא יורד עדיין
      metadata: { expertId, clientId, description: 'VeriSess SOS' },
    });

    // מחזירים ל-Frontend מזהה סודי (Client Secret) שיאפשר ללקוח להזין אשראי ישירות מול סטרייפ (PCI Compliance)
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error("Stripe Intent Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =========================================================
// נתיב 2: גביית הכסף בפועל בסוף השיחה (Capture Funds)
// מופעל כשהמטפל מסיים את שיחת הוידאו בהצלחה
// =========================================================
app.post('/api/payments/capture', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    // אומרים לסטרייפ: "הלקוח קיבל את השירות, אפשר למשוך את הכסף ששוריין"
    const intent = await stripe.paymentIntents.capture(paymentIntentId);
    
    res.status(200).json({ success: true, status: intent.status });
  } catch (error) {
    console.error("Stripe Capture Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =========================================================
// נתיב 3: שליחת התראת SMS למטפל (Twilio SOS Ping)
// מופעל כשהלקוח מחכה בחדר הטיפול
// =========================================================
app.post('/api/notify/sos', async (req, res) => {
  try {
    const { providerPhone, providerName } = req.body;

    // ניסוח ההודעה
    const smsBody = `🚨 התראת VeriSess SOS 🚨\nשלום ${providerName}, לקוח שילם וממתין לך כעת בחדר הטיפול! היכנס למערכת במהירות: https://verisess.com/dashboard`;

    // סימולציה למסך הטרמינל (עד שיוגדר חשבון Twilio אמיתי)
    console.log(`\n📲 [TWILIO SIMULATION] Sending SMS to ${providerPhone}:`);
    console.log(`💬 Message: ${smsBody}\n`);

    // קוד פרודקשן (כשמפתחות Twilio יהיו מוזנים):
    /*
    const message = await twilioClient.messages.create({
      body: smsBody,
      from: TWILIO_PHONE_NUMBER,
      to: providerPhone
    });
    console.log("SMS Sent ID:", message.sid);
    */

    res.status(200).json({ success: true, simulated: true, message: "ההתראה נשלחה" });
  } catch (error) {
    console.error("Twilio Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =========================================================
// הפעלת השרת
// =========================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ VeriSess Backend is running on port ${PORT}`);
  console.log(`💳 Stripe Payment Engine: ONLINE`);
  console.log(`📱 Twilio SMS Engine: ONLINE (Simulated)`);
});
