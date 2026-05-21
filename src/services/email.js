import { stageTitles, stageIntros, getEmailTemplateHtml } from "../firebase/emailTemplates";

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
