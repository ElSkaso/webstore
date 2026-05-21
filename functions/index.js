/**
 * Rene Puskas Jewelry — Backend Cloud Functions
 */

const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {setGlobalOptions} = require("firebase-functions");
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Initialize Firebase Admin SDK
initializeApp();
const db = getFirestore();

// Import email templates
const {stageTitles, stageIntros, getEmailTemplateHtml} = require("./emailTemplates");

// Cost and instances control
setGlobalOptions({maxInstances: 10});

/**
 * Cloud Function to securely send order status emails using Resend.
 * Stage 1 is accessible to public guest checkout.
 * Stages 2, 3, 4 require admin credentials.
 */
exports.sendOrderEmail = onCall({secrets: ["RESEND_API_KEY"]}, async (request) => {
  const {orderId, stage, trackingNumber} = request.data;

  if (!orderId || !stage) {
    throw new HttpsError("invalid-argument", "Missing orderId or stage.");
  }

  // 1. Fetch authentic order data directly from Firestore
  let order;
  try {
    const orderDoc = await db.collection("orders").document(orderId).get();
    if (!orderDoc.exists) {
      throw new HttpsError("not-found", `Order ${orderId} does not exist.`);
    }
    order = orderDoc.data();
  } catch (error) {
    logger.error("Firestore read error:", error);
    throw new HttpsError("internal", "Failed to retrieve order records.");
  }

  // 2. Validate permissions based on stage transitions
  if (stage > 1) {
    const userEmail = request.auth && request.auth.token && request.auth.token.email;
    if (userEmail !== "rene.puskas@googlemail.com") {
      throw new HttpsError("permission-denied", "Unauthorized admin action.");
    }
  }

  // 3. Render high-fidelity email templates
  const subject = `RP-2026: ${stageTitles[stage - 1]} — Bestellung ${order.id}`;
  const htmlContent = getEmailTemplateHtml(order, stage, stageIntros[stage - 1], trackingNumber || "");

  // 4. Retrieve Secret API Key
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.error("RESEND_API_KEY secret is not configured in Google Cloud Secret Manager.");
    throw new HttpsError("failed-precondition", "Backend mail configuration missing.");
  }

  // 5. Secure Server-to-Server Resend Call (Bypassing browser CORS)
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Rene Puskas <noreply@renepuskas.com>",
        to: order.email,
        subject: subject,
        html: htmlContent,
      }),
    });

    const resData = await response.json();
    if (!response.ok) {
      logger.error("Resend API failed response:", resData);
      throw new HttpsError("internal", resData.message || "Email provider dispatch failed.");
    }

    logger.info(`Email successfully dispatched for order ${orderId}, stage ${stage}. Msg ID: ${resData.id}`);
    return {success: true, id: resData.id};
  } catch (error) {
    logger.error("Network or provider error dispatching email:", error);
    throw new HttpsError("internal", error.message || "Failed to dispatch email.");
  }
});
