import { NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getActiveProducts();
  const light = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    image: p.image,
    price: p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : null,
    stockStatus: p.stockStatus
  }));
  return NextResponse.json(light);
}
