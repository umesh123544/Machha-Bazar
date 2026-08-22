import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { getPageContent, savePageContent } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const content = await getPageContent(id);
  if (!content) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(content);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requirePermission("content");
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, content, image } = body as { title: string; content: string; image?: string };

  await savePageContent(id, title, content, image || "");

  revalidatePath("/about");
  revalidatePath("/care-guide");
  revalidatePath("/contact");

  return NextResponse.json({ success: true });
}
