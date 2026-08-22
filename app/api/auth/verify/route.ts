import { NextRequest, NextResponse } from "next/server";
import {
  createCustomerSessionToken,
  getCustomerSessionCookieName
} from "@/lib/customer-auth";
import {
  getCustomerByEmail,
  getCustomerVerificationState,
  markCustomerEmailVerified,
  touchCustomerLogin
} from "@/lib/data";
import { verifyOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const code = String(body.code || "").trim();

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Enter the verification code." },
        { status: 400 }
      );
    }

    const state = await getCustomerVerificationState(email);
    if (!state) {
      return NextResponse.json(
        { success: false, message: "Account not found." },
        { status: 404 }
      );
    }

    if (state.emailVerified) {
      // Already verified (e.g. double submit) — just fall through to login below.
    } else {
      const notExpired =
        state.verificationExpiresAt && new Date(state.verificationExpiresAt).getTime() > Date.now();
      const matches = verifyOtp(code, email, state.verificationCodeHash);

      if (!notExpired || !matches) {
        return NextResponse.json(
          { success: false, message: "That code is invalid or has expired. Request a new one." },
          { status: 400 }
        );
      }

      await markCustomerEmailVerified(email);
    }

    const user = await getCustomerByEmail(email);
    if (!user) {
      return NextResponse.json({ success: false, message: "Account not found." }, { status: 404 });
    }

    await touchCustomerLogin(user.id);

    const token = createCustomerSessionToken({
      customerId: user.id,
      email: user.email,
      name: user.name
    });
    const response = NextResponse.json({
      success: true,
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneCountryCode: user.phoneCountryCode,
        address: user.address,
        deliveryArea: user.deliveryArea,
        notes: user.notes,
        avatarUrl: user.avatarUrl || ""
      }
    });
    response.cookies.set(getCustomerSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  } catch (err) {
    console.error("verify error", err);
    return NextResponse.json(
      { success: false, message: "Could not verify. Please try again." },
      { status: 500 }
    );
  }
}
