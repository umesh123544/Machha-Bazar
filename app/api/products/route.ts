import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, addProduct } from "@/lib/data";
import { requirePermission } from "@/lib/auth";
import type { Product } from "@/lib/types";

export async function GET() {
  return NextResponse.json(await getAllProducts());
}

export async function POST(request: NextRequest) {
  if (!(await requirePermission("products"))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<Product>;

  const newProduct: Product = {
    id: `p${Date.now()}`,
    name: body.name || "Untitled fish",
    slug: (body.slug || body.name || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category: body.category || "Guppy",
    categorySlug: body.categorySlug || "guppy",
    description: body.description || "",
    shortDescription: body.shortDescription || "",
    size: body.size || "",
    image: body.image || "/icons/fish-placeholder.svg",
    galleryImages: body.galleryImages || ["/icons/fish-placeholder.svg"],
    variants: body.variants || [],
    stockStatus: body.stockStatus || "in_stock",
    isFeatured: body.isFeatured || false,
    isActive: body.isActive ?? true,
    isComingSoon: body.isComingSoon || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const created = await addProduct(newProduct);
  return NextResponse.json(created, { status: 201 });
}
