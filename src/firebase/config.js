import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";


// These keys can be configured in a .env file:
// VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key-rene-puskas",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rene-puskas-shop.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rene-puskas-shop",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rene-puskas-shop.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000"
};

// Check if credentials are placeholders (mock mode flag)
export const isMockFirebase = 
  !import.meta.env.VITE_FIREBASE_API_KEY || 
  import.meta.env.VITE_FIREBASE_API_KEY === "mock-api-key-rene-puskas";

let app;
let db;
let auth;

if (!isMockFirebase) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("Firebase initialized successfully in Production Mode.");
  } catch (error) {
    console.error("Firebase initialization failed, falling back to Mock Mode:", error);
    app = null;
    db = null;
    auth = null;
  }
} else {
  console.warn(
    "Running in FIREBASE MOCK MODE. Registrations will be saved to local storage. " +
    "To connect to live Firebase, add a .env file with VITE_FIREBASE_API_KEY and other credentials."
  );
}

// Custom abstraction for Drop Registration
export const saveRegistration = async (email, config) => {
  const registrationData = {
    email,
    metal: config.metal, // "Silver" | "18k Gold Plated" | "18k Rose Gold Plated"
    stones: config.stones, // "Brown Stripe-Agate" | "Black-Trio"
    length: config.length, // CM number
    timestamp: new Date().toISOString()
  };

  if (isMockFirebase || !db) {
    // Mock Mode: Save to localstorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = JSON.parse(localStorage.getItem("rp_registrations") || "[]");
        current.push(registrationData);
        localStorage.setItem("rp_registrations", JSON.stringify(current));
        resolve({ success: true, mode: "mock", data: registrationData });
      }, 800); // Simulated delay for visual luxury feedback
    });
  } else {
    // Live Firebase Firestore mode
    const { collection, addDoc } = await import("firebase/firestore");
    return addDoc(collection(db, "registrations"), registrationData)
      .then((docRef) => ({ success: true, mode: "live", id: docRef.id, data: registrationData }))
      .catch((error) => {
        console.error("Firestore save failed:", error);
        throw error;
      });
  }
};

// Custom abstraction to read registrations (For Private Admin Panel)
export const getRegistrations = async () => {
  if (isMockFirebase || !db) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem("rp_registrations") || "[]");
        resolve(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }, 500);
    });
  } else {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    const q = query(collection(db, "registrations"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const registrations = [];
    querySnapshot.forEach((doc) => {
      registrations.push({ id: doc.id, ...doc.data() });
    });
    return registrations;
  }
};

// Custom abstraction for Google Admin Login
export const loginWithGoogle = async () => {
  if (isMockFirebase || !auth) {
    // Mock Mode: Simulate a successful login for the admin
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          user: { email: "rene.puskas@googlemail.com", displayName: "Rene Puskas (Mock)" }
        });
      }, 800);
    });
  } else {
    // Live Firebase Auth mode
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Google Auth failed:", error);
      throw error;
    }
  }
};


export { app, db, auth };
