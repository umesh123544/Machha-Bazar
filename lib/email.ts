// Sends the signup email-verification code.
//
// Two providers are supported — pick whichever env vars you set:
//  1) Gmail SMTP (free, no domain needed) — set GMAIL_USER + GMAIL_APP_PASSWORD.
//  2) Resend (needs a verified domain to email real customers) — set RESEND_API_KEY.
//
// If GMAIL_USER is set, Gmail is used. Otherwise it falls back to Resend.
// See .env.example for setup instructions for each.

import nodemailer from "nodemailer";

const RESEND_API_URL = "https://api.resend.com/emails";

function buildHtml(code: string, name?: string) {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return `
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
}

async function sendViaGmail(to: string, code: string, name?: string) {
  const user = process.env.GMAIL_USER as string;
  const pass = process.env.GMAIL_APP_PASSWORD as string;
  const fromName = process.env.GMAIL_FROM_NAME || "Maccha Bazar";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: `${fromName} <${user}>`,
    to,
    subject: `${code} is your Maccha Bazar verification code`,
    html: buildHtml(code, name)
  });
}

async function sendViaResend(to: string, code: string, name?: string) {
  const apiKey = process.env.RESEND_API_KEY as string;
  const from = process.env.RESEND_FROM_EMAIL || "Maccha Bazar <onboarding@resend.dev>";
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
      html: buildHtml(code, name)
    })
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("Resend email failed:", res.status, errText);
    throw new Error("Could not send verification email.");
  }
}

export async function sendVerificationEmail(to: string, code: string, name?: string) {
  const hasGmail = !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD;
  const hasResend = !!process.env.RESEND_API_KEY;

  if (hasGmail) {
    await sendViaGmail(to, code, name);
    return { skipped: false };
  }

  if (hasResend) {
    await sendViaResend(to, code, name);
    return { skipped: false };
  }

  // No email provider configured — don't crash the signup flow in local
  // dev, just log the code so it can still be tested.
  console.warn(
    `[email] No email provider configured (GMAIL_USER or RESEND_API_KEY). Verification code for ${to}: ${code}`
  );
  return { skipped: true };
}
