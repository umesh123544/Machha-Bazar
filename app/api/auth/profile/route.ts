import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { updateCustomer } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const session = await getCurrentCustomer();
  if (!session) {
    return NextResponse.json({ success: false, message: "Not logged in." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateCustomer(session.customerId, {
      name: body.name,
      phone: body.phone,
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
