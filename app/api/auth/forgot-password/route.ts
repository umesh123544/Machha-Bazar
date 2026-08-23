import { NextRequest, NextResponse } from "next/server";
import { getCustomerResetState, setCustomerResetCode } from "@/lib/data";
import { generateOtp, hashOtp, RESEND_COOLDOWN_MS, VERIFICATION_TTL_MS } from "@/lib/otp";
import { sendPasswordResetEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required." }, { status: 400 });
    }

    const state = await getCustomerResetState(email);

    // Always respond success even if the account doesn't exist, so the
    // form can't be used to check which emails have accounts.
    if (!state) {
      return NextResponse.json({ success: true });
    }

    if (state.resetSentAt) {
      const elapsed = Date.now() - new Date(state.resetSentAt).getTime();
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
    await setCustomerResetCode(email, codeHash, expiresAt);
    await sendPasswordResetEmail(email, code, state.name);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("forgot-password error", err);
    return NextResponse.json(
      { success: false, message: "Could not send reset code. Please try again." },
      { status: 500 }
    );
  }
}
