import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { updateCustomer, getCustomerById } from "@/lib/data";
import { uploadImage } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024; // 3MB

export async function POST(request: NextRequest) {
  const session = await getCurrentCustomer();
  if (!session) {
    return NextResponse.json({ success: false, message: "Not logged in." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const defaultAvatar = formData.get("defaultAvatar");

    // Pick from 5 defaults
    if (typeof defaultAvatar === "string" && defaultAvatar) {
      const allowed = [
        "/avatars/default-1.svg",
        "/avatars/default-2.svg",
        "/avatars/default-3.svg",
        "/avatars/default-4.svg",
        "/avatars/default-5.svg"
      ];
      if (!allowed.includes(defaultAvatar)) {
        return NextResponse.json({ success: false, message: "Invalid default avatar." }, { status: 400 });
      }
      const updated = await updateCustomer(session.customerId, { avatarUrl: defaultAvatar });
      return NextResponse.json({
        success: true,
        avatarUrl: updated?.avatarUrl || defaultAvatar
      });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "No file provided." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, message: "Only images allowed." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, message: "Image must be under 3MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer, file.name || "avatar.jpg", file.type, "avatars");
    const updated = await updateCustomer(session.customerId, { avatarUrl: url });
    return NextResponse.json({
      success: true,
      avatarUrl: updated?.avatarUrl || url
    });
  } catch (err) {
    console.error("avatar upload error", err);
    return NextResponse.json({ success: false, message: "Could not save photo." }, { status: 500 });
  }
}
