"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

type Mode = "login" | "forgot" | "reset";

export default function AdminLoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");

  // Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Forgot / reset
  const [resetUsername, setResetUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Login ──────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Enter both username and password.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.message || "Login failed.");
    }
  }

  // ── Forgot — send OTP ──────────────────────────────────
  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!resetUsername.trim()) {
      setError("Enter your admin username.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: resetUsername.trim() })
    });
    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setSuccess("Reset code sent to the admin email. Check your inbox.");
      setMode("reset");
    } else {
      setError(data.message || "Failed to send reset email.");
    }
  }

  // ── Reset — verify OTP + set new password ─────────────
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!code.trim() || !newPassword || !confirmPassword) {
      setError("Fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: resetUsername.trim(), code: code.trim(), newPassword })
    });
    setLoading(false);
    const data = await res.json();
    if (res.ok) {
      setSuccess("Password reset! You can now log in with your new password.");
      setMode("login");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(data.message || "Reset failed.");
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-cream-soft rounded-2xl p-8">
        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-plum flex items-center justify-center mb-4">
          <Lock size={16} className="text-amber" />
        </div>

        {/* ── LOGIN ── */}
        {mode === "login" && (
          <>
            <h1 className="text-lg font-medium text-plum mb-1">Admin login</h1>
            <p className="text-xs text-ink-muted mb-6">Sign in to manage Maccha Bazar.</p>
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-xs text-[#A32D2D]">{error}</p>}
              {success && <p className="text-xs text-green-700">{success}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-plum text-cream text-sm font-medium rounded-lg py-2.5 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("forgot"); setError(""); setSuccess(""); }}
                className="w-full text-xs text-ink-muted hover:text-plum text-center pt-1"
              >
                Forgot password?
              </button>
            </form>
          </>
        )}

        {/* ── FORGOT — enter username to receive OTP ── */}
        {mode === "forgot" && (
          <>
            <h1 className="text-lg font-medium text-plum mb-1">Reset password</h1>
            <p className="text-xs text-ink-muted mb-6">
              Enter your admin username and we&apos;ll send a reset code to the admin email.
            </p>
            <form onSubmit={handleForgot} className="space-y-3">
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Username</label>
                <input
                  type="text"
                  value={resetUsername}
                  onChange={(e) => setResetUsername(e.target.value)}
                  className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
                  placeholder="admin"
                />
              </div>
              {error && <p className="text-xs text-[#A32D2D]">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-plum text-cream text-sm font-medium rounded-lg py-2.5 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send reset code"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
                className="w-full text-xs text-ink-muted hover:text-plum text-center pt-1"
              >
                ← Back to login
              </button>
            </form>
          </>
        )}

        {/* ── RESET — enter OTP + new password ── */}
        {mode === "reset" && (
          <>
            <h1 className="text-lg font-medium text-plum mb-1">Enter reset code</h1>
            <p className="text-xs text-ink-muted mb-6">
              Check the admin email inbox for the 6-digit code.
            </p>
            <form onSubmit={handleReset} className="space-y-3">
              <div>
                <label className="text-xs text-ink-muted mb-1 block">6-digit code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5 tracking-widest text-center font-mono"
                  placeholder="000000"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-xs text-[#A32D2D]">{error}</p>}
              {success && <p className="text-xs text-green-700">{success}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-plum text-cream text-sm font-medium rounded-lg py-2.5 disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>
              <button
                type="button"
                onClick={() => { setMode("forgot"); setError(""); setSuccess(""); setCode(""); }}
                className="w-full text-xs text-ink-muted hover:text-plum text-center pt-1"
              >
                ← Resend code
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
