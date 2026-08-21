import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSessionToken, getSessionCookieName } from "@/lib/auth";
import { getAdminUserByUsername } from "@/lib/data";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ success: false, message: "Enter both username and password." }, { status: 400 });
  }

  // Primary path: check the admin_users table.
  try {
    const dbUser = await getAdminUserByUsername(username);
    if (dbUser) {
      const valid = await bcrypt.compare(password, dbUser.passwordHash);
      if (valid) {
        return respondWithSession(dbUser.username, dbUser.isOwner, dbUser.permissions);
      }
      return NextResponse.json({ success: false, message: "Invalid username or password." }, { status: 401 });
    }
  } catch (err) {
    console.error("admin_users lookup failed, falling back to env credentials", err);
  }

  // Fallback / bootstrap path: env credentials, in case admin_users hasn't been seeded yet.
  const envUsername = process.env.ADMIN_USERNAME || "admin";
  const envPassword = process.env.ADMIN_PASSWORD || "aquarealm2026";
  if (username === envUsername && password === envPassword) {
    return respondWithSession(username, true, { products: true, content: true, users: true });
  }

  return NextResponse.json({ success: false, message: "Invalid username or password." }, { status: 401 });
}

function respondWithSession(username: string, isOwner: boolean, permissions: { products: boolean; content: boolean; users: boolean }) {
  const token = createSessionToken({ username, isOwner, permissions });
  const response = NextResponse.json({ success: true });
  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
