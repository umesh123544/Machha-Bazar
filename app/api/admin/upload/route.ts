import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { uploadImage } from "@/lib/storage";
import type { AdminPermissions } from "@/lib/types";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const scope = (formData.get("scope") as string) || "products";

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No file provided." }, { status: 400 });
  }

  const permissionKey: keyof AdminPermissions = scope === "banner" ? "content" : "products";
  const admin = await requirePermission(permissionKey);
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Only image files are allowed." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "Image must be under 5MB." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = scope === "banner" ? "banner" : "products";

  try {
    const url = await uploadImage(buffer, file.name, file.type, folder);
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Upload failed. Check that the 'site-images' storage bucket exists in Supabase." }, { status: 500 });
  }
}
