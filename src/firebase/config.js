import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { stageTitles, stageIntros, getEmailTemplateHtml } from "./emailTemplates";
export { getEmailTemplateHtml } from "./emailTemplates";



// These keys can be configured in a .env file:
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

// Helper to generate a quiet-luxury serial number like RP-2026-X8B4
const generateOrderId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RP-2026-${result}`;
};

// ==========================================
// 1. ORDER & TRANSACTION SCHEMAS (PRE-ORDERS)
// ==========================================

export const saveOrder = async (customerDetails, configuration) => {
  const orderId = generateOrderId();
  const orderData = {
    id: orderId,
    email: customerDetails.email.trim(),
    customerName: `${customerDetails.firstName.trim()} ${customerDetails.lastName.trim()}`,
    createdAt: new Date().toISOString(),
    configuration: {
      productId: "rp-beaded-bracelet-s1",
      metal: configuration.metal, // "Silver" | "18k Gold Plated" | "18k Rose Gold Plated"
      stones: configuration.stones, // "Brown Stripe-Agate" | "Black-Trio"
      length: configuration.length, // CM
      basePrice: configuration.basePrice || 165,
      priceModifier: configuration.priceModifier || 0,
      totalPrice: configuration.totalPrice || 165
    },
    productionStatus: {
      currentStage: 1, // 1: Verfügbarkeit, 2: Einkauf, 3: Produktion, 4: Versand
      lastUpdated: new Date().toISOString(),
      estimatedDelivery: "ca. 8 Wochen ab Bestelleingang",
      stageHistory: [
        {
          stage: 1,
          timestamp: new Date().toISOString(),
          notes: "Pre-order erfolgreich gesichert. Verfügbarkeit und Mineralienbedarf bestätigt."
        }
      ]
    },
    shipping: {
      carrier: null,
      trackingNumber: null,
      address: {
        street: customerDetails.street.trim(),
        city: customerDetails.city.trim(),
        zip: customerDetails.zip.trim(),
        country: customerDetails.country.trim()
      }
    }
  };

  if (isMockFirebase || !db) {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const current = JSON.parse(localStorage.getItem("rp_orders") || "[]");
        current.push(orderData);
        localStorage.setItem("rp_orders", JSON.stringify(current));
        
        // Trigger Stage 1 Welcome Email automatically in background
        await sendResendEmail(orderData.email, orderData, 1);
        
        resolve({ success: true, mode: "mock", id: orderId, data: orderData });
      }, 2000); // 2 seconds simulated delay for high-fidelity payment visual
    });
  } else {
    const { doc, setDoc } = await import("firebase/firestore");
    try {
      await setDoc(doc(db, "orders", orderId), orderData);
      
      // Trigger Stage 1 Welcome Email
      await sendResendEmail(orderData.email, orderData, 1);
      
      return { success: true, mode: "live", id: orderId, data: orderData };
    } catch (error) {
      console.error("Firestore saveOrder failed:", error);
      throw error;
    }
  }
};

export const getOrders = async () => {
  if (isMockFirebase || !db) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = JSON.parse(localStorage.getItem("rp_orders") || "[]");
        resolve(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }, 500);
    });
  } else {
    const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const orders = [];
      querySnapshot.forEach((doc) => {
        orders.push(doc.data());
      });
      return orders;
    } catch (error) {
      console.error("Firestore getOrders failed:", error);
      throw error;
    }
  }
};

export const updateOrderStatus = async (orderId, nextStage, trackingNumber = "") => {
  const stageTitles = [
    "Verfügbarkeitsbestätigung",
    "Einkaufsbestätigung (Bali)",
    "Erhalt des Silbers & Produktionsstart",
    "Versandbestätigung"
  ];
  
  const stageNotes = [
    "Pre-order erfolgreich gesichert. Verfügbarkeit und Mineralienbedarf bestätigt.",
    "Rohmaterialien ethically-sourced und in Bali erworben. Transit ins deutsche Atelier gestartet.",
    "Silber & Steine eingetroffen. Präzise Handarbeit und Feil-Schliffe im Atelier gestartet.",
    "Qualitätskontrolle abgeschlossen. An DHL Express übergeben."
  ];

  const updateFields = {
    "productionStatus.currentStage": nextStage,
    "productionStatus.lastUpdated": new Date().toISOString()
  };

  if (nextStage === 4 && trackingNumber) {
    updateFields["shipping.carrier"] = "DHL Express";
    updateFields["shipping.trackingNumber"] = trackingNumber;
  }

  if (isMockFirebase || !db) {
    return new Promise((resolve) => {
      const data = JSON.parse(localStorage.getItem("rp_orders") || "[]");
      const orderIndex = data.findIndex(o => o.id === orderId);
      
      if (orderIndex !== -1) {
        const order = data[orderIndex];
        order.productionStatus.currentStage = nextStage;
        order.productionStatus.lastUpdated = new Date().toISOString();
        
        order.productionStatus.stageHistory.push({
          stage: nextStage,
          timestamp: new Date().toISOString(),
          notes: stageNotes[nextStage - 1]
        });

        if (nextStage === 4 && trackingNumber) {
          order.shipping.carrier = "DHL Express";
          order.shipping.trackingNumber = trackingNumber;
        }

        data[orderIndex] = order;
        localStorage.setItem("rp_orders", JSON.stringify(data));
        
        // Trigger Email update in mock mode
        sendResendEmail(order.email, order, nextStage, trackingNumber);
        
        resolve({ success: true, data: order });
      } else {
        resolve({ success: false, error: "Order not found" });
      }
    });
  } else {
    const { doc, getDoc, updateDoc, arrayUnion } = await import("firebase/firestore");
    const orderRef = doc(db, "orders", orderId);
    try {
      const orderDoc = await getDoc(orderRef);
      if (!orderDoc.exists()) {
        throw new Error("Order not found");
      }
      
      const orderData = orderDoc.data();
      
      await updateDoc(orderRef, {
        ...updateFields,
        "productionStatus.stageHistory": arrayUnion({
          stage: nextStage,
          timestamp: new Date().toISOString(),
          notes: stageNotes[nextStage - 1]
        })
      });

      // Fetch fresh data for email
      const updatedDoc = await getDoc(orderRef);
      const freshOrder = updatedDoc.data();
      
      // Trigger E-Mail sending
      await sendResendEmail(freshOrder.email, freshOrder, nextStage, trackingNumber);

      return { success: true };
    } catch (error) {
      console.error("Firestore updateOrderStatus failed:", error);
      throw error;
    }
  }
};

export const batchUpdateOrderStatus = async (orderIds, nextStage) => {
  if (!orderIds || orderIds.length === 0) return { success: true };

  const promises = orderIds.map(id => updateOrderStatus(id, nextStage));
  await Promise.all(promises);
  return { success: true };
};

// ==========================================
// 2. TRANSACTIONAL E-MAIL ENGINE (RESEND)
// ==========================================

export const sendResendEmail = async (email, order, stage, trackingNumber = "") => {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  // If no env key, run in Mock E-Mail mode (safe, local offline development)
  const isMock = !apiKey || apiKey === "mock-api-key-rene-puskas";

  const subject = `RP-2026: ${stageTitles[stage - 1]} — Bestellung ${order.id}`;
  const htmlContent = getEmailTemplateHtml(order, stage, stageIntros[stage - 1], trackingNumber);

  if (isMock) {
    console.log(`%c[MOCK EMAIL SENT TO ${email}]`, "color: #d4af37; font-weight: bold; font-size: 11px;");
    console.log(`Subject: ${subject}`);
    
    // Save to a mock mail log so the admin dashboard can read and display it in the Email Previewer!
    const mockMails = JSON.parse(localStorage.getItem("rp_mock_emails") || "[]");
    mockMails.push({
      id: "mail_" + Math.random().toString(36).substring(2, 10),
      to: email,
      subject,
      html: htmlContent,
      timestamp: new Date().toISOString(),
      stage
    });
    localStorage.setItem("rp_mock_emails", JSON.stringify(mockMails));
    return { success: true, mode: "mock", subject };
  } else {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: "Rene Puskas <noreply@renepuskas.com>",
          to: email,
          subject: subject,
          html: htmlContent
        })
      });
      
      const resData = await response.json();
      if (!response.ok) {
        console.error("Resend API error:", resData);
        throw new Error(resData.message || "Email sending failed");
      }
      return { success: true, mode: "live", id: resData.id };
    } catch (error) {
      console.error("Failed to send live Resend email:", error);
      // Fail safely for client ease in development
      return { success: true, mode: "fallback-error", error: error.message };
    }
  }
};



// ==========================================
// 3. LEGACY MOCK / LIVE COMPATIBILITY
// ==========================================

// Custom abstraction for Drop Registration
export const saveRegistration = async (email, config) => {
  const registrationData = {
    email,
    metal: config.metal, // "Silver" | "18k Gold Plated" | "18k Rose Gold Plated"
    stones: config.stones, // "Brown Stripe-Agate" | "Black-Trio"
    length: config.length, // CM number
    timestamp: new Date().toISOString(),
    exported: false
  };

  if (isMockFirebase || !db) {
    // Mock Mode: Save to localstorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockId = "mock_" + Math.random().toString(36).substring(2, 10);
        const current = JSON.parse(localStorage.getItem("rp_registrations") || "[]");
        const savedData = { id: mockId, ...registrationData };
        current.push(savedData);
        localStorage.setItem("rp_registrations", JSON.stringify(current));
        resolve({ success: true, mode: "mock", id: mockId, data: registrationData });
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
        let data = JSON.parse(localStorage.getItem("rp_registrations") || "[]");
        // Ensure legacy mock data has IDs
        let modified = false;
        data = data.map(d => {
          if (!d.id) {
            modified = true;
            return { ...d, id: "mock_" + Math.random().toString(36).substring(2, 10) };
          }
          return d;
        });
        if (modified) {
          localStorage.setItem("rp_registrations", JSON.stringify(data));
        }
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

// Custom abstraction to mark registrations as exported
export const markRegistrationsExported = async (ids) => {
  if (!ids || ids.length === 0) return;

  if (isMockFirebase || !db) {
    const data = JSON.parse(localStorage.getItem("rp_registrations") || "[]");
    const updated = data.map(d => ids.includes(d.id) ? { ...d, exported: true } : d);
    localStorage.setItem("rp_registrations", JSON.stringify(updated));
    return { success: true };
  } else {
    const { writeBatch, doc } = await import("firebase/firestore");
    const batch = writeBatch(db);
    ids.forEach(id => {
      const ref = doc(db, "registrations", id);
      batch.update(ref, { exported: true });
    });
    await batch.commit();
    return { success: true };
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
