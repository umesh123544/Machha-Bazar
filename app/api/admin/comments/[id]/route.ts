import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { deleteProductComment } from "@/lib/data";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requirePermission("products");
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteProductComment(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("admin delete comment error", err);
    return NextResponse.json({ message: "Could not delete comment." }, { status: 500 });
  }
}
