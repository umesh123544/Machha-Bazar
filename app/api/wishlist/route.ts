import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { addToWishlist, getProductById, getWishlistProductIds, getWishlistProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

/** GET: the logged-in customer's wishlist. Add ?idsOnly=1 for just product ids (used by product cards). */
export async function GET(request: NextRequest) {
  const session = await getCurrentCustomer();
  if (!session) {
    return NextResponse.json({ products: [], productIds: [], loggedIn: false });
  }

  try {
    if (request.nextUrl.searchParams.get("idsOnly")) {
      const productIds = await getWishlistProductIds(session.customerId);
      return NextResponse.json({ productIds, loggedIn: true });
    }
    const products = await getWishlistProducts(session.customerId);
    return NextResponse.json({ products, loggedIn: true });
  } catch (err) {
    console.error("get wishlist error", err);
    return NextResponse.json(
      { message: "Could not load wishlist. Run migration_14.sql in Supabase if the table is missing." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getCurrentCustomer();
  if (!session) {
    return NextResponse.json({ message: "Please log in to save products." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const productId = String(body.productId || "").trim();
  if (!productId) {
    return NextResponse.json({ message: "productId is required" }, { status: 400 });
  }

  try {
    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }
    await addToWishlist(session.customerId, productId);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("add wishlist error", err);
    return NextResponse.json({ message: "Could not save this product." }, { status: 500 });
  }
}
