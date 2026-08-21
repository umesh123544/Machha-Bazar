import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requirePermission } from "@/lib/auth";
import { getAllAdminUsers, createAdminUser, getAdminUserByUsername } from "@/lib/data";

export async function GET() {
  const admin = await requirePermission("users");
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const users = await getAllAdminUsers();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const admin = await requirePermission("users");
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { username, password, permissions } = body as {
    username?: string;
    password?: string;
    permissions?: { products?: boolean; content?: boolean; users?: boolean };
  };

  if (!username || !username.trim()) {
    return NextResponse.json({ message: "Username is required." }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await getAdminUserByUsername(username.trim());
  if (existing) {
    return NextResponse.json({ message: "That username is already taken." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createAdminUser({
    username: username.trim(),
    passwordHash,
    isOwner: false,
    permissions: {
      products: Boolean(permissions?.products),
      content: Boolean(permissions?.content),
      users: Boolean(permissions?.users)
    }
  });

  return NextResponse.json(user, { status: 201 });
}
