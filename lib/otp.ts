import crypto from "crypto";

export const VERIFICATION_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const RESEND_COOLDOWN_MS = 45 * 1000; // 45 seconds between resend requests

export function generateOtp(): string {
  // 6-digit numeric code, zero-padded.
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function getSecret() {
  return process.env.ADMIN_SECRET || "dev-secret-change-me";
}

export function hashOtp(code: string, email: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`${email.toLowerCase().trim()}:${code}`)
    .digest("hex");
}

export function verifyOtp(code: string, email: string, storedHash: string | null): boolean {
  if (!storedHash) return false;
  const expected = hashOtp(code, email);
  const a = Buffer.from(expected);
  const b = Buffer.from(storedHash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
