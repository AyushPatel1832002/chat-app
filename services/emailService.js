const { Resend } = require("resend");

// Initialize Resend with API Key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email notification to an offline user
 * @param {Object} data - Email data
 * @param {string} data.to - Recipient email
 * @param {string} data.senderName - Name of the person who sent the message
 * @param {string} data.messagePreview - A short snippet of the message
 * @returns {Promise<Object>} - Resend API response
 */
const sendOfflineMessageEmail = async ({ to, senderName, messagePreview }) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is missing in .env");
    return { error: "Missing API Key" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const { data, error } = await resend.emails.send({
      from: "Aura Chat <notifications@resend.dev>", // Replace with your verified domain in production
      to: [to],
      subject: `New message from ${senderName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #6366f1; margin-bottom: 20px;">Aura Chat</h2>
          <p style="font-size: 16px; color: #1e293b; margin-bottom: 10px;">Hello,</p>
          <p style="font-size: 16px; color: #1e293b; line-height: 1.5;">
            <strong>${senderName}</strong> sent you a new message while you were away.
          </p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
            <p style="margin: 0; color: #475569; font-style: italic;">
              "${messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview}"
            </p>
          </div>
          <a href="${appUrl}/chat" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
            Open Chat
          </a>
          <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            You are receiving this because offline notifications are enabled for your account.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return { error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Email Service Error:", err);
    return { error: err.message };
  }
};

module.exports = {
  sendOfflineMessageEmail,
};
