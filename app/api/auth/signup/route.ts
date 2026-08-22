import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  createCustomerSessionToken,
  getCustomerSessionCookieName
} from "@/lib/customer-auth";
import { createCustomer, getCustomerByEmail } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const address = String(body.address || "").trim();
    const deliveryArea = String(body.deliveryArea || "").trim();

    if (!name || !phone || !email || !password) {
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

    const existing = await getCustomerByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await createCustomer({
      name,
      phone,
      email,
      passwordHash,
      address,
      deliveryArea
    });

    const token = createCustomerSessionToken({
      customerId: customer.id,
      email: customer.email,
      name: customer.name
    });
    const response = NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        deliveryArea: customer.deliveryArea,
        notes: customer.notes
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
    console.error("signup error", err);
    return NextResponse.json(
      { success: false, message: "Could not create account. Please try again." },
      { status: 500 }
    );
  }
}
