import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key-rene-puskas",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rene-puskas-shop.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rene-puskas-shop",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rene-puskas-shop.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000"
};

export const isMockFirebase = 
  !import.meta.env.VITE_FIREBASE_API_KEY || 
  import.meta.env.VITE_FIREBASE_API_KEY === "mock-api-key-rene-puskas";

let app;
let db;
let auth;
let functions;

if (!isMockFirebase) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    functions = getFunctions(app);
    console.log("Firebase initialized successfully in Production Mode.");
  } catch (error) {
    console.error("Firebase initialization failed, falling back to Mock Mode:", error);
    app = null;
    db = null;
    auth = null;
    functions = null;
  }
} else {
  console.warn(
    "Running in FIREBASE MOCK MODE. Registrations will be saved to local storage. " +
    "To connect to live Firebase, add a .env file with VITE_FIREBASE_API_KEY and other credentials."
  );
}

export { app, db, auth, functions };

