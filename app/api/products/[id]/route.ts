import { NextRequest, NextResponse } from "next/server";
import { updateProduct, deleteProduct } from "@/lib/data";
import { requirePermission } from "@/lib/auth";
import type { Product } from "@/lib/types";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("products"))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as Partial<Product>;
  const updated = await updateProduct(params.id, body);
  if (!updated) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requirePermission("products"))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await deleteProduct(params.id);
  return NextResponse.json({ success: true });
}
