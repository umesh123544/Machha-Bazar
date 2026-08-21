import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { getCategories } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const admin = await requirePermission("products");
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, slug, description, active, comingSoon, sortOrder } = body;

  const { data, error } = await supabaseAdmin
    .from("categories")
    .insert({
      id: `cat_${Date.now()}`,
      name,
      slug,
      description: description || "",
      active: active ?? true,
      coming_soon: comingSoon ?? false,
      sort_order: sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  revalidatePath("/shop");
  return NextResponse.json(data);
}
