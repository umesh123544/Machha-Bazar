import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createCustomer, getCustomerByEmail } from "@/lib/data";
import { findCountry, isValidPhoneForCountry, onlyDigits } from "@/lib/countries";
import { generateOtp, hashOtp, VERIFICATION_TTL_MS } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const phoneRaw = String(body.phone || "").trim();
    const countryCode = String(body.countryCode || "NP").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!name || !phoneRaw || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, phone, email and password are required." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }
    if (!email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    const country = findCountry(countryCode);
    const phoneDigits = onlyDigits(phoneRaw);
    if (!isValidPhoneForCountry(phoneDigits, countryCode)) {
      return NextResponse.json(
        {
          success: false,
          message: `Enter a valid ${country.name} phone number (${country.digits} digits, no country code).`
        },
        { status: 400 }
      );
    }

    const existing = await getCustomerByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const code = generateOtp();
    const codeHash = hashOtp(code, email);
    const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS).toISOString();

    const customer = await createCustomer({
      name,
      phone: phoneDigits,
      phoneCountryCode: country.dial,
      email,
      passwordHash,
      verificationCodeHash: codeHash,
      verificationExpiresAt: expiresAt
    });

    try {
      await sendVerificationEmail(customer.email, code, customer.name);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Account created but we couldn't send the verification email. Please try resending it."
        },
        { status: 502 }
      );
    }

    // No session cookie yet — the account isn't usable until the email is verified.
    return NextResponse.json({
      success: true,
      needsVerification: true,
      email: customer.email
    });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json(
      { success: false, message: "Could not create account. Please try again." },
      { status: 500 }
    );
  }
}
