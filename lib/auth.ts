import crypto from "crypto";
import { cookies } from "next/headers";
import type { AdminPermissions } from "./types";

const COOKIE_NAME = "macchabazar_admin_session";

export type AdminSessionPayload = {
  username: string;
  isOwner: boolean;
  permissions: AdminPermissions;
  ts: number;
};

function getSecret() {
  return process.env.ADMIN_SECRET || "dev-secret-change-me";
}

export function createSessionToken(payload: Omit<AdminSessionPayload, "ts">): string {
  const full: AdminSessionPayload = { ...payload, ts: Date.now() };
  const encoded = Buffer.from(JSON.stringify(full), "utf-8").toString("base64url");
  const signature = crypto.createHmac("sha256", getSecret()).update(encoded).digest("hex");
  return `${encoded}.${signature}`;
}

export function decodeSessionToken(token: string | undefined): AdminSessionPayload | null {
  if (!token) return null;
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;
    const expected = crypto.createHmac("sha256", getSecret()).update(encoded).digest("hex");
    if (expected !== signature) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf-8")) as AdminSessionPayload;
    const age = Date.now() - payload.ts;
    if (age > 1000 * 60 * 60 * 24 * 7) return null; // 7 day session
    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export async function getCurrentAdmin(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  return decodeSessionToken(store.get(COOKIE_NAME)?.value);
}

export async function isAdminAuthed(): Promise<boolean> {
  return (await getCurrentAdmin()) !== null;
}

// Owners always have every permission. Non-owners are gated by their stored flags.
export async function requirePermission(key: keyof AdminPermissions): Promise<AdminSessionPayload | null> {
  const admin = await getCurrentAdmin();
  if (!admin) return null;
  if (admin.isOwner || admin.permissions[key]) return admin;
  return null;
}
