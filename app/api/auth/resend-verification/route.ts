import { NextRequest, NextResponse } from "next/server";
import { getCustomerVerificationState, setCustomerVerificationCode } from "@/lib/data";
import { generateOtp, hashOtp, RESEND_COOLDOWN_MS, VERIFICATION_TTL_MS } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
    }

    const state = await getCustomerVerificationState(email);
    if (!state) {
      return NextResponse.json({ success: false, message: "Account not found." }, { status: 404 });
    }
    if (state.emailVerified) {
      return NextResponse.json({ success: false, message: "This email is already verified." }, { status: 409 });
    }

    if (state.verificationSentAt) {
      const elapsed = Date.now() - new Date(state.verificationSentAt).getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const waitSec = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          { success: false, message: `Please wait ${waitSec}s before requesting another code.` },
          { status: 429 }
        );
      }
    }

    const code = generateOtp();
    const codeHash = hashOtp(code, email);
    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS).toISOString();
    await setCustomerVerificationCode(email, codeHash, expiresAt);
    await sendVerificationEmail(email, code, state.name);

    return NextResponse.json({ success: true, message: "Verification code sent." });
  } catch (err) {
    console.error("resend-verification error", err);
    return NextResponse.json(
      { success: false, message: "Could not resend code. Please try again." },
      { status: 500 }
    );
  }
}
