import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { removeFromWishlist } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest, { params }: { params: { productId: string } }) {
  const session = await getCurrentCustomer();
  if (!session) {
    return NextResponse.json({ message: "Please log in first." }, { status: 401 });
  }

  try {
    await removeFromWishlist(session.customerId, params.productId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("remove wishlist error", err);
    return NextResponse.json({ message: "Could not remove this product." }, { status: 500 });
  }
}
