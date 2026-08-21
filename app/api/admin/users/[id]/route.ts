import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { getAllAdminUsers, deleteAdminUser } from "@/lib/data";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requirePermission("users");
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const users = await getAllAdminUsers();
  const target = users.find((u) => u.id === params.id);
  if (target?.isOwner) {
    return NextResponse.json({ message: "The owner account cannot be deleted." }, { status: 400 });
  }

  await deleteAdminUser(params.id);
  return NextResponse.json({ success: true });
}
