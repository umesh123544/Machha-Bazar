import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "macchabazar_customer_session";

export type CustomerSessionPayload = {
  customerId: string;
  email: string;
  name: string;
  ts: number;
};

function getSecret() {
  return process.env.ADMIN_SECRET || "dev-secret-change-me";
}

export function createCustomerSessionToken(
  payload: Omit<CustomerSessionPayload, "ts">
): string {
  const full: CustomerSessionPayload = { ...payload, ts: Date.now() };
  const encoded = Buffer.from(JSON.stringify(full), "utf-8").toString("base64url");
  const signature = crypto.createHmac("sha256", getSecret()).update(encoded).digest("hex");
  return `${encoded}.${signature}`;
}

export function decodeCustomerSessionToken(
  token: string | undefined
): CustomerSessionPayload | null {
  if (!token) return null;
  try {
    const [encoded, signature] = token.split(".");
    if (!encoded || !signature) return null;
    const expected = crypto.createHmac("sha256", getSecret()).update(encoded).digest("hex");
    if (expected !== signature) return null;
    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf-8")
    ) as CustomerSessionPayload;
    const age = Date.now() - payload.ts;
    if (age > 1000 * 60 * 60 * 24 * 30) return null; // 30 day session
    return payload;
  } catch {
    return null;
  }
}

export function getCustomerSessionCookieName() {
  return COOKIE_NAME;
}

export async function getCurrentCustomer(): Promise<CustomerSessionPayload | null> {
  const store = await cookies();
  return decodeCustomerSessionToken(store.get(COOKIE_NAME)?.value);
}
