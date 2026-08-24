import { NextRequest, NextResponse } from "next/server";
import { generateOtp, hashOtp, VERIFICATION_TTL_MS } from "@/lib/otp";
import { sendPasswordResetEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// In-memory OTP store for admin reset (same process, expires in 10 min)
// Keyed by username so multiple admins can reset independently.
export const adminResetStore = new Map<string, { hash: string; expiresAt: number }>();

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  if (!username || typeof username !== "string") {
    return NextResponse.json({ message: "Username required." }, { status: 400 });
  }

  // Check env-based admin first
  const envUsername = process.env.ADMIN_USERNAME || "admin";
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return NextResponse.json(
      { message: "Admin email not configured. Set ADMIN_EMAIL in your environment variables." },
      { status: 500 }
    );
  }

  // Accept reset for the env admin, or any username (email goes to the single ADMIN_EMAIL)
  // We don't reveal whether the username exists (security best practice).
  const code = generateOtp();
  const hash = hashOtp(code, username);
  adminResetStore.set(username.toLowerCase().trim(), {
    hash,
    expiresAt: Date.now() + VERIFICATION_TTL_MS
  });

  try {
    await sendPasswordResetEmail(adminEmail, code, username);
  } catch (err) {
    console.error("Admin reset email failed:", err);
    return NextResponse.json({ message: "Failed to send reset email. Check email config." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
