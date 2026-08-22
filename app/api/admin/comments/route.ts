import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { getAllProducts, getAllProductComments } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requirePermission("products");
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [comments, products] = await Promise.all([getAllProductComments(), getAllProducts()]);
    const productMap = new Map(products.map((p) => [p.id, p]));

    const list = comments.map((c) => {
      const product = productMap.get(c.productId);
      return {
        ...c,
        productName: product?.name || "Deleted product",
        productSlug: product?.slug || ""
      };
    });

    return NextResponse.json({ comments: list });
  } catch (err) {
    console.error("admin comments error", err);
    return NextResponse.json(
      {
        message: "Could not load comments. Run migration_11.sql in Supabase if the table is missing."
      },
      { status: 500 }
    );
  }
}
