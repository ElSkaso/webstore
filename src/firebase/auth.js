import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, isMockFirebase } from "./init";

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
