// =========================================================
// VeriSess Backend Server - מנוע הכספים ואבטחת המידע
// =========================================================
const express = require('express');
const cors = require('cors');

// אתחול Stripe עם המפתח הסודי (Secret Key) שהבאת מהדאשבורד
// בפרודקשן אמיתי, נחביא את זה בתוך קובץ .env
const stripe = require('stripe')('sk_test_51ThmvWQVqEdHngCF2DRmIPVYtspJ30Lqeylw6LjtdQHgNUqTpGu0PsaXqJM0fX96H59EQAPH5XDI6e96sErznobL00eomIUzuc');

const app = express();

// הגדרות אבטחה: מאפשר לאפליקציית ה-React שלנו לדבר עם השרת הזה
app.use(cors({ origin: true }));
app.use(express.json());

// =========================================================
// נתיב 1: שריון כספים מלקוח (Create Payment Intent)
// =========================================================
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    const { amount, expertId, clientId } = req.body;

    // כאן אנחנו מבקשים מ-Stripe להכין "כוונה לתשלום"
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe עובד באגורות/סנטים, אז כופלים ב-100
      currency: 'ils', // שקל חדש
      
      // פיצ'ר ה"שריון" (Auth & Capture) - אנחנו תופסים את המסגרת, אבל לא גובים עד סוף השיחה!
      capture_method: 'manual', 
      
      metadata: {
        expertId: expertId,
        clientId: clientId,
        description: 'VeriSess SOS Video Consultation'
      },
    });

    // אנחנו מחזירים לאפליקציה (למסך Checkout) "סוד לקוח" 
    // כדי שיוכל להציג את טופס האשראי המאובטח של Stripe
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// =========================================================
// נתיב 2: גביית הכסף בפועל בסוף השיחה (Capture Funds)
// =========================================================
app.post('/api/payments/capture', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // הלקוח והמטפל סיימו שיחה? מצוין. עכשיו באמת נמשוך את הכסף.
    const intent = await stripe.paymentIntents.capture(paymentIntentId);
    
    res.status(200).json({ success: true, status: intent.status });

  } catch (error) {
    console.error("Capture Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// הפעלת השרת על פורט 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ VeriSess Backend is running on port ${PORT}`);
  console.log(`🔒 Stripe Payment Engine is INITIALIZED`);
});
