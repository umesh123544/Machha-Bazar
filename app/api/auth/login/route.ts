import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  createCustomerSessionToken,
  getCustomerSessionCookieName
} from "@/lib/customer-auth";
import { getCustomerByEmail, touchCustomerLogin } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Enter email and password." },
        { status: 400 }
      );
    }

    const user = await getCustomerByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          needsVerification: true,
          email: user.email,
          message: "Please verify your email before logging in."
        },
        { status: 403 }
      );
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
    console.error("login error", err);
    return NextResponse.json(
      { success: false, message: "Could not log in. Please try again." },
      { status: 500 }
    );
  }
}
