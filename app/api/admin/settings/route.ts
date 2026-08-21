import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { getSiteSettings, saveSiteSettings } from "@/lib/data";
import type { SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const admin = await requirePermission("content");
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<SiteSettings>;
  const current = await getSiteSettings();
  const merged: SiteSettings = { ...current, ...body };
  await saveSiteSettings(merged);
  return NextResponse.json(merged);
}
