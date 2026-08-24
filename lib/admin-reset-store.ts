// Shared in-memory OTP store for admin password reset (10 min expiry)
// Keyed by username so multiple admins can reset independently.
export const adminResetStore = new Map<string, { hash: string; expiresAt: number }>();

