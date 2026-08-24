import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyOtp } from "@/lib/otp";
import { adminResetStore } from "@/lib/admin-reset-store";
import { getAdminUserByUsername } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { username, code, newPassword } = await req.json();

  if (!username || !code || !newPassword) {
    return NextResponse.json({ message: "All fields required." }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
  }

  const key = username.toLowerCase().trim();
  const record = adminResetStore.get(key);

  if (!record || Date.now() > record.expiresAt) {
    adminResetStore.delete(key);
    return NextResponse.json({ message: "Code expired. Please request a new one." }, { status: 400 });
  }

  if (!verifyOtp(code, username, record.hash)) {
    return NextResponse.json({ message: "Invalid code." }, { status: 400 });
  }

  // OTP valid — clear it immediately (single use)
  adminResetStore.delete(key);

  const newHash = await bcrypt.hash(newPassword, 10);

  // Try to update in admin_users table (DB-based admin)
  try {
    const dbUser = await getAdminUserByUsername(username);
    if (dbUser) {
      const { error } = await supabaseAdmin
        .from("admin_users")
        .update({ password_hash: newHash })
        .eq("username", username);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    console.error("DB password update failed:", err);
  }

  // Env-based admin: cannot update env vars at runtime — instruct user to update .env / Vercel
  const envUsername = process.env.ADMIN_USERNAME || "admin";
  if (username === envUsername) {
    return NextResponse.json({
      message:
        "Your admin account uses environment variables. Update ADMIN_PASSWORD in your Vercel environment variables and redeploy."
    }, { status: 422 });
  }

  return NextResponse.json({ message: "Admin user not found." }, { status: 404 });
}
