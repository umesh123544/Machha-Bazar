import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCurrentAdmin } from "@/lib/auth";
import {
  getAllCustomers,
  getAllCustomerOrders,
  getCustomerOrderCounts,
  createCustomer,
  deleteCustomer,
  getCustomerByEmail
} from "@/lib/data";
import { findCountry, isValidPhoneForCountry, onlyDigits } from "@/lib/countries";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [customers, orders, counts] = await Promise.all([
      getAllCustomers(),
      getAllCustomerOrders(50),
      getCustomerOrderCounts()
    ]);

    const list = customers.map((c) => ({
      ...c,
      orderCount: counts[c.id] || 0
    }));

    return NextResponse.json({ customers: list, recentOrders: orders });
  } catch (err) {
    console.error("admin customers error", err);
    return NextResponse.json(
      {
        message:
          "Could not load customers. Run migration_8.sql in Supabase if tables are missing."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const phoneRaw = String(body.phone || "").trim();
    const countryCode = String(body.countryCode || "NP").trim();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
    }

    let phoneDigits = "";
    const country = findCountry(countryCode);
    if (phoneRaw) {
      phoneDigits = onlyDigits(phoneRaw);
      if (!isValidPhoneForCountry(phoneDigits, countryCode)) {
        return NextResponse.json(
          {
            message: `Enter a valid ${country.name} phone number (${country.digits} digits, no country code).`
          },
          { status: 400 }
        );
      }
    }

    const existing = await getCustomerByEmail(email);
    if (existing) {
      return NextResponse.json({ message: "A customer with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await createCustomer({
      name,
      phone: phoneDigits,
      phoneCountryCode: country.dial,
      email,
      passwordHash,
      address: body.address,
      deliveryArea: body.deliveryArea,
      emailVerified: true // admin-added customers can log in immediately
    });

    return NextResponse.json({ customer });
  } catch (err) {
    console.error("admin create customer error", err);
    return NextResponse.json({ message: "Could not create customer." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Customer id is required." }, { status: 400 });
    }
    await deleteCustomer(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("admin delete customer error", err);
    return NextResponse.json({ message: "Could not delete customer." }, { status: 500 });
  }
}

