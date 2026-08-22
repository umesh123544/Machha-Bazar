import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { createCustomerOrder, getCustomerById } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      return NextResponse.json({ success: false, message: "Cart is empty." }, { status: 400 });
    }

    const totalPrice = items.reduce(
      (sum: number, i: { price?: number; quantity?: number }) =>
        sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
      0
    );

    const session = await getCurrentCustomer();
    let customerName = String(body.customerName || "").trim();
    let customerPhone = String(body.customerPhone || "").trim();
    let customerEmail = String(body.customerEmail || "").trim();
    let customerAddress = String(body.customerAddress || "").trim();
    let deliveryArea = String(body.deliveryArea || "").trim();
    let customerId: string | null = null;

    if (session) {
      customerId = session.customerId;
      const profile = await getCustomerById(session.customerId);
      if (profile) {
        customerName = customerName || profile.name;
        customerPhone = customerPhone || profile.phone;
        customerEmail = customerEmail || profile.email;
        customerAddress = customerAddress || profile.address;
        deliveryArea = deliveryArea || profile.deliveryArea;
      }
    }

    const order = await createCustomerOrder({
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      deliveryArea,
      items: items.map((i: {
        productId?: string;
        slug?: string;
        name?: string;
        variantName?: string;
        price?: number;
        quantity?: number;
      }) => ({
        productId: String(i.productId || ""),
        slug: String(i.slug || ""),
        name: String(i.name || ""),
        variantName: String(i.variantName || ""),
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1
      })),
      totalPrice
    });

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err) {
    console.error("order log error", err);
    return NextResponse.json({ success: false, message: "Could not log order." }, { status: 500 });
  }
}
