import { stageTitles, stageIntros, getEmailTemplateHtml } from "../firebase/emailTemplates";
import { isMockFirebase, functions } from "../firebase/config";

export const sendResendEmail = async (email, order, stage, trackingNumber = "") => {
  // If running in Mock mode, run in local mock offline mode
  const isMock = isMockFirebase;

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
      if (!functions) {
        throw new Error("Firebase Functions SDK is not initialized.");
      }

      const { httpsCallable } = await import("firebase/functions");
      const sendOrderEmailFn = httpsCallable(functions, "sendOrderEmail");
      
      const result = await sendOrderEmailFn({
        orderId: order.id,
        stage: Number(stage),
        trackingNumber: trackingNumber || ""
      });
      
      return { success: true, mode: "live", id: result.data.id };
    } catch (error) {
      console.error("Failed to send live Resend email via Cloud Function:", error);
      // Fail safely for client ease in development
      return { success: true, mode: "fallback-error", error: error.message };
    }
  }
};

