"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-cream-soft rounded-2xl p-8">
        <div className="w-10 h-10 rounded-full bg-plum flex items-center justify-center mb-4">
          <Lock size={16} className="text-amber" />
        </div>
        <h1 className="text-lg font-medium text-plum mb-1">Admin login</h1>
        <p className="text-xs text-ink-muted mb-6">Sign in to manage Maccha Bazar.</p>
        <form onSubmit={handleSubmit} className="space-y-3">
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-plum text-cream text-sm font-medium rounded-lg py-2.5 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
