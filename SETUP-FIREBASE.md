# הגדרת Firebase ל-VeriSess

פרויקט Firebase אחד לכל משפחת האתרים: **`verisess-43aa7`** (SSO משותף, חינם).

## 1. שירותים להפעיל בקונסולה

- **Authentication** → Sign-in method → הפעל **Email/Password** (וגם **Anonymous** למסלול הלקוח האנונימי).
- **Firestore Database** → צור מסד (Production mode) → הדבק את החוקים מסעיף 3.
- **Storage** → הפעל (לווידאו-אינטרו של מומחים, שלב ב').

## 2. קונפיגורציה ל-Frontend

העתק `.env.example` ל-`.env` ומלא מ-Firebase Console → Project settings → Your apps.
ה-`apiKey` ציבורי במכוון (מוגן ע"י החוקים למטה) — אבל עדיין נטען מ-`.env` ולא מקובע בקוד.

## 3. חוקי אבטחה (Firestore Rules)

> **עיקרון קדוש:** כל שדה/אוסף חדש מלווה בעדכון החוקים כאן. ללא חוקים — הפיצ'ר לא מסופק.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }

    // מנהל: מזוהה ע"י Custom Claim { admin: true } (מוגדר ב-Cloud Function / סקריפט admin)
    function isAdmin() { return isSignedIn() && request.auth.token.admin == true; }

    // ---- פרופילי מומחים: מזהה המסמך = ה-UID של המומחה ----
    match /providers/{uid} {
      allow read: if true;                       // קטלוג ציבורי
      allow create: if isOwner(uid);
      // המומחה עורך את הפרופיל, אך שדה status (אישור KYC) שמור למנהל בלבד:
      allow update: if isOwner(uid)
                    && request.resource.data.status == resource.data.status;
      allow update, delete: if isAdmin();
    }

    // תת-אוסף זמינות (שלב ה')
    match /providers/{uid}/availability/{slotId} {
      allow read: if true;
      allow write: if isOwner(uid) || isAdmin();
    }

    // ---- ארנקים: קריאה לבעלים בלבד; כתיבה דרך טרנזקציות (פיילוט) ----
    // ⚠️ פיילוט: הכתיבה נעשית מהדפדפן. הכללים למטה מגבילים גישה בסיסית,
    //    אך אכיפת השלמות המלאה (שאין ניפוח יתרה) מגיעה בשלב ז' עם
    //    Cloud Functions Callable — אז נחליף allow write ל-`if false`.
    match /wallets/{uid} {
      allow read: if isOwner(uid) || isAdmin()
                  || uid == 'platform' && isAdmin();
      allow write: if isSignedIn();              // פיילוט בלבד — להחליף ל-`if false` בשלב ז'
    }

    // ספר תנועות append-only: אי אפשר לערוך/למחוק תנועה קיימת
    match /wallet_ledger/{id} {
      allow read: if isSignedIn() && (resource.data.uid == request.auth.uid || isAdmin());
      allow create: if isSignedIn();             // פיילוט
      allow update, delete: if false;            // append-only לתמיד
    }

    // שריונים פעילים
    match /wallet_holds/{holdId} {
      allow read: if isSignedIn() && (resource.data.uid == request.auth.uid
                    || resource.data.providerId == request.auth.uid || isAdmin());
      allow create, update: if isSignedIn();     // פיילוט
      allow delete: if false;
    }

    // בקשות משיכה של מומחים
    match /wallet_payouts/{id} {
      allow read: if isSignedIn() && (resource.data.uid == request.auth.uid || isAdmin());
      allow create: if isSignedIn() && request.resource.data.uid == request.auth.uid
                    && request.resource.data.status == 'pending';
      allow update: if isAdmin();                // רק המנהל מאשר משיכה
      allow delete: if false;
    }

    // ---- הזמנות ----
    match /bookings/{id} {
      allow read: if isSignedIn() && (resource.data.clientId == request.auth.uid
                    || resource.data.providerId == request.auth.uid || isAdmin());
      allow create: if isSignedIn();
      allow update: if isSignedIn() && (resource.data.providerId == request.auth.uid
                    || resource.data.clientId == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }
  }
}
```

## 4. הגדרת מנהל (Admin)

הרשאות המנהל נשענות על **Custom Claim** `{ admin: true }`, לא על סיסמה בקוד.
להגדרה חד-פעמית (Cloud Function או סקריפט Admin SDK):

```js
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

> הערה: בגרסת הדמו הישנה (`src/AdminPanel.jsx` הנפרד) יש סיסמה מקובעת `admin123`.
> זו רק סימולציה ואסור שתגיע לפרודקשן — הגישה האמיתית עוברת דרך ה-Claim לעיל.

## 5. ארנק הפלטפורמה

מסמך `wallets/platform` הוא ארנק הבעלים. כל `walletCapture` מזין אותו אוטומטית
בעמלה (20% מתוזמנת · 30% SOS · 20% דיל · 15% קבוצתי). קריא למנהל בלבד.
