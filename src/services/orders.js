import { db, isMockFirebase } from "../firebase/init";
import { sendResendEmail } from "./email";

const generateOrderId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RP-2026-${result}`;
};

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
