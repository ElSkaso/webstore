import { db, isMockFirebase } from "../firebase/init";

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
