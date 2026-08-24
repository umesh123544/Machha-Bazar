import { NextRequest, NextResponse } from "next/server";
import { generateOtp, hashOtp, VERIFICATION_TTL_MS } from "@/lib/otp";
import { sendPasswordResetEmail } from "@/lib/email";
import { adminResetStore } from "@/lib/admin-reset-store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { username } = await req.json();

  if (!username || typeof username !== "string") {
    return NextResponse.json({ message: "Username required." }, { status: 400 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return NextResponse.json(
      { message: "Admin email not configured. Set ADMIN_EMAIL in environment variables." },
      { status: 500 }
    );
  }

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
    return NextResponse.json({ message: "Failed to send reset email." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
