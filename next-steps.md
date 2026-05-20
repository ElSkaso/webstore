# Rene Puskas Jewelry — Project Next Steps

This document outlines the actionable next steps for the **Rene Puskas** quiet-luxury beaded bracelet e-commerce store. Follow this guide to run, test, customize, and deploy your new validation-driven e-commerce page.

---

## 🚀 1. Local Development & Immediate Verification

Your project is built with React, Vite, and TailwindCSS v4. It features a zero-configuration database fallback that works right out of the box using `localStorage` if no Firebase credentials are provided.

### Start the Development Server
Run the following commands in your terminal from the project directory:
```bash
# Start the development server
npm run dev
```

### Key Interactive Features to Verify
1. **Premium Hero Section**: Look at the luxury serif typography, minimalist brand header, and material sourcing cards.
2. **Interactive visual Configurator**:
   - Swap **Metal Platings**: Toggle between 925 Sterling Silver, 18k Gold Plated, and 18k Rose Gold Plated to see instant color updates in the visualizer.
   - Swap **Stones**: Toggle between Brown Stripe-Agate and the Black-Trio (onyx and lava stone).
   - Adjust **Bracelet Length**: Change size options and observe how the stone bead counts dynamically recalculate.
3. **Printable Measuring Tape**: Click the size guide ruler icon, click **"Print Measuring Tape"**, and verify the print layout preserves the 1:1 scale matching standard office printers (equipped with a 50mm ruler validation line).
4. **Limited-Drop Reservation**:
   - Enter your email and click "Reserve".
   - The app will save your exact configuration (chosen stone, chosen metal plating, chosen size) along with a timestamp.
5. **Secure Admin Analytics Dashboard**:
   - Navigate to the admin path in your browser: `/admin`.
   - Enter the secure dashboard code: **`rp2026`**
   - Verify that you can view real-time statistics (total registrations, stone distributions, plating preferences, sizing averages) and export all submissions to a standard `.csv` file.

---

## 💾 2. Connecting a Live Database (Google Cloud Firebase)

The application includes a dual-mode database abstraction in [src/firebase/config.js](file:///Users/rene/Documents/Projekte/shop/src/firebase/config.js). By default, it operates in **Mock Mode** using the browser's `localStorage` (perfect for local demos, offline work, and instant testing).

To transition to a live database:
1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Click **Add Project** and name it `rene-puskas-shop` (or your preferred name).
2. **Create a Web App & Copy Configuration**:
   - Inside the project dashboard, click the `</>` (Web) icon to register a web app.
   - Copy the `firebaseConfig` object containing:
     ```javascript
     const firebaseConfig = {
       apiKey: "...",
       authDomain: "...",
       projectId: "...",
       storageBucket: "...",
       messagingSenderId: "...",
       appId: "..."
     };
     ```
3. **Enable Firestore Database**:
   - In the left sidebar, click **Build > Firestore Database**.
   - Click **Create Database**, select a region close to you, and start in **Production Mode** or **Test Mode**.
4. **Environment Variables Configuration**:
   - Create a file named `.env` in your project root: `/Users/rene/Documents/Projekte/shop/.env`
   - Map your Firebase web credentials to the following environment variables:
     ```env
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```
   - Restart the Vite development server. The app will automatically detect these variables and seamlessly connect to Cloud Firestore!

---

## ✍️ 3. Copywriting & Visual Adjustments

To refine the messaging and fine-tune your brand story:
* **Product Configuration Metadata**: Modify [src/productConfig.js](file:///Users/rene/Documents/Projekte/shop/src/productConfig.js) to customize:
  - Base descriptions, materials, and stone characteristics.
  - Sourcing editorial text for the 925 sterling silver, raw mineral lava, onyx, stripe-agate beads, and carabiner safety hardware.
* **Component Text**: Modify [src/App.jsx](file:///Users/rene/Documents/Projekte/shop/src/App.jsx) for custom drop dates, email notifications, and footer statements.

---

## 🌐 4. Production Build & Deployment

To launch the web shop globally so real users can access the interactive page:

### Build for Production
Run the production compiler to generate a optimized, minified bundle:
```bash
npm run build
```
This generates highly optimized static assets in the `/dist` directory.

### Deploying the Store (Options)
1. **Firebase Hosting (Recommended / Free Tier)**:
   - Install the Firebase CLI: `npm install -g firebase-tools`
   - Run `firebase login` and `firebase init hosting`.
   - Select your project, choose `/dist` as your public directory, and configure as a single-page app.
   - Run `firebase deploy` to launch it onto a secure `web.app` subdomain.
2. **Vercel or Netlify (One-click Git integrations)**:
   - Connect your shop repository to Vercel or Netlify.
   - Set the build command to `npm run build` and publish directory to `dist`.
   - Setup your environment variables in their dashboard settings.

### Custom Domain Setup
Map your custom domain (`renepuskas.com` or similar) through the hosting provider's DNS dashboard to complete the premium quiet-luxury presentation.
