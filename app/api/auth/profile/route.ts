import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { updateCustomer } from "@/lib/data";
import { findCountry, isValidPhoneForCountry, onlyDigits } from "@/lib/countries";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const session = await getCurrentCustomer();
  if (!session) {
    return NextResponse.json({ success: false, message: "Not logged in." }, { status: 401 });
  }

  try {
    const body = await request.json();

    let phone = body.phone;
    let phoneCountryCode = body.countryCode ? findCountry(body.countryCode).dial : undefined;
    if (phone !== undefined && body.countryCode) {
      const country = findCountry(body.countryCode);
      const digits = onlyDigits(String(phone));
      if (!isValidPhoneForCountry(digits, body.countryCode)) {
        return NextResponse.json(
          {
            success: false,
            message: `Enter a valid ${country.name} phone number (${country.digits} digits, no country code).`
          },
          { status: 400 }
        );
      }
      phone = digits;
    }

    const updated = await updateCustomer(session.customerId, {
      name: body.name,
      phone,
      phoneCountryCode,
      address: body.address,
      deliveryArea: body.deliveryArea,
      notes: body.notes,
      avatarUrl: body.avatarUrl
    });
    if (!updated) {
      return NextResponse.json({ success: false, message: "Account not found." }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      customer: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        phoneCountryCode: updated.phoneCountryCode,
        address: updated.address,
        deliveryArea: updated.deliveryArea,
        notes: updated.notes,
        avatarUrl: updated.avatarUrl || ""
      }
    });
  } catch (err) {
    console.error("profile update error", err);
    return NextResponse.json(
      { success: false, message: "Could not save profile." },
      { status: 500 }
    );
  }
}
