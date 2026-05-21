# Rene Puskas Jewelry — Project Next Steps

This document outlines the actionable next steps for the **Rene Puskas** quiet-luxury beaded bracelet e-commerce store, which has been pivoted to a high-transparency **Pre-Order Sourcing & Production Tracker**.

---

## 🚀 1. Local Development & Verification (Mock Mode)

Your project is built with React, Vite, and TailwindCSS v4. It features a zero-configuration developer experience that works right out of the box using `localStorage` if no Firebase or Resend credentials are provided.

### Start the Development Server
Run the following command in your terminal from the project directory:
```bash
npm run dev
```

### Key Interactive Features to Verify
1. **Premium Hero Section**: Look at the luxury serif typography, minimalist brand header, and material sourcing cards.
2. **Interactive Visual Configurator**:
   - Swap **Metal Platings**: Toggle between 925 Sterling Silver, 18k Gold Plated, and 18k Rose Gold Plated to see instant color updates in the visualizer.
   - Swap **Stones**: Toggle between Brown Stripe-Agate and the Black-Trio (onyx and lava stone).
   - Adjust **Bracelet Length**: Change size options and observe how the stone bead counts dynamically recalculate.
3. **Printable Measuring Tape**: Click the size guide ruler icon, click **"Print Measuring Tape"**, and verify the print layout preserves the 1:1 scale matching standard office printers (equipped with a 50mm ruler validation line).
4. **Checkout Drawer & Payment Simulator**:
   - Configure your bracelet and click **"Pre-Order Jetzt — 165 €"**.
   - Review your chosen custom design recap in the slide-out Checkout Drawer.
   - Fill in shipping details, choose a mock payment option (Credit Card or PayPal), and submit.
   - Watch the buttery-smooth 2-second dark loader cycle through high-fidelity gateway steps (*"Connecting to gateway..."*, *"Securing mineral allocation..."*).
   - Verify that you are presented with a minimalist Success modal showing a unique, serial-style Order ID (e.g. `RP-2026-X8B4`).
5. **Secure Admin Sourcing Dashboard**:
   - Navigate to the admin path in your browser: `/admin`.
   - Enter the secure dashboard code: **`rp2026`**
   - Click the **"Pre-Orders"** tab. Verify that your pre-order appears instantly in Stage 1 (*"Verfügbarkeitsbestätigung"*).
   - Click **"Sourcing Bali starten (Batch)"**. Verify that the status shifts to Stage 2 (*"Einkaufsbestätigung"*) and updates the database.
   - Click **"Produktion starten (Batch)"**. Verify that the order transitions to Stage 3 (*"Produktionsstart"*).
   - In the DHL Sendungsnummer input field next to the order, type a mock tracking ID (e.g., `1Z999AA10123456784`) and click **"Ship"**. Verify that the order enters Stage 4 (*"Versandbestätigung"*).
6. **E-Mail Logs & Visual Previewer**:
   - Click on the **"E-Mails"** sub-tab in `/admin`.
   - View the history of sent transactional emails.
   - Click **"Vorschau anzeigen"** next to any mail log to inspect the stunning HSL dark-mode HTML template rendering live inside a responsive iframe!

---

## 💾 2. Connecting a Live Database (Google Cloud Firebase)

The application includes a dual-mode database abstraction in `src/firebase/config.js`.

To transition from local `localStorage` mock mode to your live Firebase project:
1. **Configure your Firebase Project**:
   - Go to your project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable the **Firestore Database** in **Production Mode**.
2. **Configure Environment Variables**:
   - Open your `.env` file in the project root: `/Users/rene/Documents/Projekte/shop/.env`
   - Set up your web application credentials:
     ```env
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```
   - Restart the development server. The client will automatically connect to your live collections!
3. **Deploy Security Rules**:
   - The security rules in [firestore.rules](file:///Users/rene/Documents/Projekte/shop/firestore.rules) have been updated to protect `/orders` as well.
   - Deploy these rules using the Firebase CLI:
     ```bash
     npx firebase deploy --only firestore:rules
     ```
   - Only your verified Google account (`rene.puskas@googlemail.com`) will be allowed to perform read, update, or delete mutations on waitlists and pre-orders.

---

## ✉️ 3. Setting Up Transactional Emails (Resend API)

To enable live email notifications to customers as their orders advance through the sourcing and production stages:
1. **Create a Resend Account**:
   - Register a free developer account at [Resend.com](https://resend.com/).
   - Add and verify your custom domain (e.g., `renepuskas.com`) in the Resend Domains settings.
2. **Add the API Key to Environment**:
   - Create an API key in the Resend dashboard.
   - Add it to your `.env` file:
     ```env
     VITE_RESEND_API_KEY=re_your_api_key_here
     ```
   - Restart your server. The mail client will automatically switch from **Mock Mail Mode** to live delivery, dispatching premium, dark HSL template emails directly from your verified brand domain!

---

## 🌐 4. Production Build & Deployment

To launch the web shop globally for your audience:

### Build for Production
Run the production compiler to generate an optimized static bundle in `/dist`:
```bash
npm run build
```

### Deploy to Hosting
Using **Firebase Hosting** (highly recommended, free tier):
```bash
# Log in to your Firebase account (if not done)
npx firebase login

# Deploy host files to live server
npx firebase deploy --only hosting
```
Your store will go live instantly on your secure `web.app` or `firebaseapp.com` subdomain!
