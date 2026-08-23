import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCustomerResetState, resetCustomerPassword } from "@/lib/data";
import { verifyOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();
    const newPassword = String(body.newPassword || "");

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Email, code and new password are required." },
        { status: 400 }
      );
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const state = await getCustomerResetState(email);
    if (!state) {
      return NextResponse.json({ success: false, message: "Account not found." }, { status: 404 });
    }

    const notExpired = state.resetExpiresAt && new Date(state.resetExpiresAt).getTime() > Date.now();
    const matches = verifyOtp(code, email, state.resetCodeHash);
    if (!notExpired || !matches) {
      return NextResponse.json(
        { success: false, message: "That code is invalid or has expired. Request a new one." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await resetCustomerPassword(email, passwordHash);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("reset-password error", err);
    return NextResponse.json(
      { success: false, message: "Could not reset password. Please try again." },
      { status: 500 }
    );
  }
}
