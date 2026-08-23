// Thin wrapper around Resend for transactional emails (currently just the
// signup email-verification code). Requires RESEND_API_KEY and
// RESEND_FROM_EMAIL to be set — see .env.example.

const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendVerificationEmail(to: string, code: string, name?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Maccha Bazar <onboarding@resend.dev>";

  if (!apiKey) {
    // No email provider configured — don't crash the signup flow in local
    // dev, just log the code so it can still be tested.
    console.warn(
      `[email] RESEND_API_KEY not set. Verification code for ${to}: ${code}`
    );
    return { skipped: true };
  }

  const greeting = name ? `Hi ${name},` : "Hi,";
  const html = `
    <div style="font-family: -apple-system, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color:#4a1d3d; margin-bottom: 8px;">Verify your email</h2>
      <p style="color:#555; font-size: 14px;">${greeting}</p>
      <p style="color:#555; font-size: 14px;">Use this code to verify your Maccha Bazar account. It expires in 10 minutes.</p>
      <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color:#4a1d3d; background:#f7f0f3; padding: 16px 0; text-align:center; border-radius: 12px; margin: 20px 0;">
        ${code}
      </div>
      <p style="color:#999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  const replyTo = process.env.RESEND_REPLY_TO_EMAIL;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: `${code} is your Maccha Bazar verification code`,
      html
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Resend email failed:", res.status, errText);
    throw new Error("Could not send verification email.");
  }

  return { skipped: false };
}
