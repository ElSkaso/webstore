import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";


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

  const stageTitles = [
    "Verfügbarkeitsbestätigung",
    "Einkaufsbestätigung",
    "Erhalt des Silbers & Produktionsstart",
    "Versandbestätigung"
  ];
  
  const stageIntros = [
    `Vielen Dank für Dein Vertrauen in ehrliche Handwerkskunst. Wir haben Deine Pre-Order für das Beaded Bracelet erfolgreich gesichert. Die Materialanforderungen sind zusammengestellt und der Sourcing-Auftrag für die Rohmaterialien nach Bali ist initiiert.`,
    `Ein wichtiger Meilenstein ist erreicht: Unsere Partner in Bali haben die ethically-sourced 925 Sterling Silber Perlen und die vulkanischen Gesteine für Deine Bestellung ausgewählt und erworben. Die Komponenten machen sich nun auf den Weg in unser deutsches Atelier.`,
    `Die edlen Mineralkomponenten und handgebürsteten Silberperlen sind unversehrt im Atelier eingetroffen. Dein Armband wird nun in präziser Handarbeit auf den hochfesten 1.0mm Edelstahl-Kern aufgezogen und mit unserer doppelten Sicherungskette vollendet.`,
    `Nach strengster Qualitätskontrolle (Gewichtsprüfung und Magnet-Zugkraftmessung) ist Dein Beaded Bracelet fertiggestellt und in unserer obsidian-schwarzen Leinen-Verpackung sicher verstaut. Das Paket wurde soeben an DHL Express übergeben.`
  ];

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

export const getEmailTemplateHtml = (order, stage, introText, trackingNumber = "") => {
  const metalName = order.configuration.metal;
  const stonesName = order.configuration.stones;
  const lengthVal = order.configuration.length;
  const totalPrice = order.configuration.totalPrice;
  const trackingLink = `https://www.dhl.com/de-de/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rene Puskas Jewelry Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d0f; font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e4e9; -webkit-font-smoothing: antialiased;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0c0d0f; min-height: 100%; padding: 40px 10px;">
    <tr>
      <td align="center" valign="top">
        <!-- Main Card Container -->
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 580px; background-color: #15171c; border: 1px style solid #242730; border-radius: 4px; overflow: hidden; border-spacing: 0;">
          <!-- Top Accenting Gold Line -->
          <tr>
            <td style="height: 3px; background-color: #d4af37;"></td>
          </tr>
          
          <!-- Editorial Typography Header -->
          <tr>
            <td align="center" style="padding: 45px 30px 20px 30px;">
              <div style="font-family: 'Cinzel', 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: normal; letter-spacing: 0.15em; color: #ffffff; text-transform: uppercase;">
                R E N E &nbsp; P U S K A S
              </div>
              <div style="font-family: -apple-system, system-ui, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.25em; color: #9196a6; text-transform: uppercase; margin-top: 8px;">
                HONEST RAW CRAFT
              </div>
            </td>
          </tr>

          <!-- Dynamic Timeline Stepper (4 Stages) -->
          <tr>
            <td align="center" style="padding: 10px 20px 25px 20px;">
              <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 440px;">
                <tr>
                  <!-- Stage 1 -->
                  <td align="center" style="width: 25%;">
                    <div style="width: 32px; height: 32px; line-height: 32px; border-radius: 50%; background-color: ${stage >= 1 ? '#d4af37' : '#242730'}; color: ${stage >= 1 ? '#0c0d0f' : '#9196a6'}; font-weight: bold; font-size: 13px; text-align: center; display: inline-block;">1</div>
                    <div style="font-size: 10px; margin-top: 8px; color: ${stage === 1 ? '#d4af37' : '#9196a6'}; font-weight: ${stage === 1 ? 'bold' : 'normal'};">Bestellt</div>
                  </td>
                  <!-- Connector 1 -->
                  <td valign="middle" style="width: 12.5%;">
                    <div style="height: 1px; background-color: ${stage >= 2 ? '#d4af37' : '#242730'}; margin-bottom: 22px;"></div>
                  </td>
                  <!-- Stage 2 -->
                  <td align="center" style="width: 25%;">
                    <div style="width: 32px; height: 32px; line-height: 32px; border-radius: 50%; background-color: ${stage >= 2 ? '#d4af37' : '#242730'}; color: ${stage >= 2 ? '#0c0d0f' : '#9196a6'}; font-weight: bold; font-size: 13px; text-align: center; display: inline-block;">2</div>
                    <div style="font-size: 10px; margin-top: 8px; color: ${stage === 2 ? '#d4af37' : '#9196a6'}; font-weight: ${stage === 2 ? 'bold' : 'normal'};">Sourcing</div>
                  </td>
                  <!-- Connector 2 -->
                  <td valign="middle" style="width: 12.5%;">
                    <div style="height: 1px; background-color: ${stage >= 3 ? '#d4af37' : '#242730'}; margin-bottom: 22px;"></div>
                  </td>
                  <!-- Stage 3 -->
                  <td align="center" style="width: 25%;">
                    <div style="width: 32px; height: 32px; line-height: 32px; border-radius: 50%; background-color: ${stage >= 3 ? '#d4af37' : '#242730'}; color: ${stage >= 3 ? '#0c0d0f' : '#9196a6'}; font-weight: bold; font-size: 13px; text-align: center; display: inline-block;">3</div>
                    <div style="font-size: 10px; margin-top: 8px; color: ${stage === 3 ? '#d4af37' : '#9196a6'}; font-weight: ${stage === 3 ? 'bold' : 'normal'};">Produktion</div>
                  </td>
                  <!-- Connector 3 -->
                  <td valign="middle" style="width: 12.5%;">
                    <div style="height: 1px; background-color: ${stage >= 4 ? '#d4af37' : '#242730'}; margin-bottom: 22px;"></div>
                  </td>
                  <!-- Stage 4 -->
                  <td align="center" style="width: 25%;">
                    <div style="width: 32px; height: 32px; line-height: 32px; border-radius: 50%; background-color: ${stage >= 4 ? '#d4af37' : '#242730'}; color: ${stage >= 4 ? '#0c0d0f' : '#9196a6'}; font-weight: bold; font-size: 13px; text-align: center; display: inline-block;">4</div>
                    <div style="font-size: 10px; margin-top: 8px; color: ${stage === 4 ? '#d4af37' : '#9196a6'}; font-weight: ${stage === 4 ? 'bold' : 'normal'};">Versand</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editorial Horizontal Line -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #242730;"></div>
            </td>
          </tr>

          <!-- Personal Greeting & Sourcing Narrative -->
          <tr>
            <td style="padding: 30px 40px 10px 40px;">
              <p style="font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 0;">
                Hallo ${order.customerName || "Kunde"},
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #9196a6; margin-bottom: 25px;">
                ${introText}
              </p>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0c0d0f; border: 1px solid #242730; border-radius: 2px; padding: 20px;">
                <tr>
                  <td colspan="2" style="font-size: 11px; font-weight: bold; letter-spacing: 0.1em; color: #ffffff; text-transform: uppercase; padding-bottom: 12px; border-bottom: 1px solid #242730;">
                    Konfiguration & Details
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9196a6; padding: 12px 0 6px 0;">Modell:</td>
                  <td align="right" style="font-size: 12px; font-weight: bold; color: #ffffff; padding: 12px 0 6px 0;">The Beaded Bracelet (Series 1)</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9196a6; padding: 6px 0;">Edelmetall:</td>
                  <td align="right" style="font-size: 12px; font-weight: bold; color: #ffffff; padding: 6px 0;">${metalName}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9196a6; padding: 6px 0;">Mineralkristalle:</td>
                  <td align="right" style="font-size: 12px; font-weight: bold; color: #ffffff; padding: 6px 0;">${stonesName}</td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #9196a6; padding: 6px 0; border-bottom: 1px solid #242730;">Umfang:</td>
                  <td align="right" style="font-size: 12px; font-weight: bold; color: #ffffff; padding: 6px 0; border-bottom: 1px solid #242730;">${lengthVal} cm</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; font-weight: bold; color: #ffffff; padding-top: 12px;">Pre-Order Betrag:</td>
                  <td align="right" style="font-size: 13px; font-weight: bold; color: #d4af37; padding-top: 12px;">EUR ${totalPrice},00</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Courier Call to Action (Only for Stage 4: Shipped) -->
          ${stage === 4 && trackingNumber ? `
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: rgba(212, 175, 55, 0.05); border: 1px dashed #d4af37; border-radius: 2px; padding: 20px; text-align: center;">
                <tr>
                  <td align="center">
                    <div style="font-size: 11px; font-weight: bold; letter-spacing: 0.1em; color: #d4af37; text-transform: uppercase; margin-bottom: 8px;">
                      Versandinformation
                    </div>
                    <div style="font-size: 14px; color: #ffffff; margin-bottom: 15px;">
                      DHL Express &mdash; Sendungsnummer: <code style="background-color: #242730; padding: 2px 6px; border-radius: 2px; font-family: monospace;">${trackingNumber}</code>
                    </div>
                    <a href="${trackingLink}" target="_blank" style="display: inline-block; background-color: #d4af37; color: #0c0d0f; font-size: 12px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; padding: 10px 20px; border-radius: 2px;">
                      Lieferung verfolgen
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Footer/Brand Philosophy -->
          <tr>
            <td align="center" style="background-color: #0c0d0f; padding: 40px 30px; border-top: 1px solid #242730;">
              <div style="font-size: 12px; color: #ffffff; margin-bottom: 6px; font-family: 'Cinzel', serif;">
                R E N E &nbsp; P U S K A S
              </div>
              <div style="font-size: 11px; color: #9196a6; max-width: 360px; line-height: 1.5; margin-bottom: 20px;">
                Wir glauben an die Ehrlichkeit von echtem Gewicht und roher Handwerkskunst. Keine Synthetik, kein künstlicher Schein.
              </div>
              <div style="font-size: 10px; color: #5a5f6e;">
                &copy; 2026 Rene Puskas. Alle Rechte vorbehalten.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
