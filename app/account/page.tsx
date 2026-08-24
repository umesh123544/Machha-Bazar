"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  User,
  LogOut,
  ShoppingCart,
  MapPin,
  Package,
  Pencil,
  Camera,
  ArrowLeft,
  Clock
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { COUNTRIES, DEFAULT_COUNTRY, findCountry, findCountryByDial, onlyDigits } from "@/lib/countries";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  phoneCountryCode?: string;
  address: string;
  deliveryArea: string;
  notes: string;
  avatarUrl?: string;
};

type OrderItem = {
  name: string;
  variantName: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  itemCount: number;
  createdAt: string;
};

const DEFAULT_AVATARS = [
  "/avatars/default-1.svg",
  "/avatars/default-2.svg",
  "/avatars/default-3.svg",
  "/avatars/default-4.svg",
  "/avatars/default-5.svg"
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-NP", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export default function AccountPage() {
  const { items, totalItems, totalPrice, openCart, removeItem, updateQuantity } = useCart();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"dashboard" | "profile">("dashboard");
  const [mode, setMode] = useState<"login" | "signup" | "verify" | "forgot" | "reset">("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY.code);

  const [verifyCode, setVerifyCode] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetCooldown, setResetCooldown] = useState(0);

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileCountryCode, setProfileCountryCode] = useState(DEFAULT_COUNTRY.code);
  const [address, setAddress] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("");
  const [notes, setNotes] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  useEffect(() => {
    if (resetCooldown <= 0) return;
    const t = setTimeout(() => setResetCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resetCooldown]);

  useEffect(() => {
    loadMe();
  }, []);

  async function loadMe() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.customer) {
        setCustomer(data.customer);
        fillProfile(data.customer);
        loadOrders();
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  async function loadOrders() {
    try {
      const res = await fetch("/api/auth/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // ignore
    }
  }

  function fillProfile(c: Customer) {
    setProfileName(c.name || "");
    setProfilePhone(c.phone || "");
    setProfileCountryCode(findCountryByDial(c.phoneCountryCode || DEFAULT_COUNTRY.dial).code);
    setAddress(c.address || "");
    setDeliveryArea(c.deliveryArea || "");
    setNotes(c.notes || "");
    setAvatarUrl(c.avatarUrl || DEFAULT_AVATARS[0]);
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (mode === "signup") {
      const country = findCountry(countryCode);
      const digits = onlyDigits(phone);
      if (digits.length !== country.digits) {
        setError(`Enter a valid ${country.name} phone number (${country.digits} digits, no country code).`);
        return;
      }
    }

    setAuthBusy(true);
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body =
      mode === "login" ? { email, password } : { email, password, name, phone, countryCode };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.needsVerification) {
          setVerifyEmail(data.email || email);
          setMode("verify");
          setResendCooldown(0);
          setError("");
          setMessage(
            mode === "signup"
              ? "We've sent a verification code to your email."
              : "Please verify your email to continue. Enter the code we sent you."
          );
          setAuthBusy(false);
          return;
        }
        setError(data.message || "Something went wrong.");
        setAuthBusy(false);
        return;
      }

      if (data.needsVerification) {
        // Signup succeeded, awaiting the OTP before a session is created.
        setVerifyEmail(data.email || email);
        setMode("verify");
        setMessage("We've sent a 6-digit verification code to your email.");
        setAuthBusy(false);
        return;
      }

      setCustomer(data.customer);
      fillProfile(data.customer);
      setView("dashboard");
      setPassword("");
      loadOrders();
      setMessage(mode === "login" ? "Welcome back!" : "Account created. Welcome!");
    } catch {
      setError("Network error. Please try again.");
    }
    setAuthBusy(false);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setAuthBusy(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, code: verifyCode })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Could not verify. Please try again.");
        setAuthBusy(false);
        return;
      }
      setCustomer(data.customer);
      fillProfile(data.customer);
      setView("dashboard");
      setMode("login");
      setPassword("");
      setVerifyCode("");
      loadOrders();
      setMessage("Email verified. Welcome!");
    } catch {
      setError("Network error. Please try again.");
    }
    setAuthBusy(false);
  }

  async function handleResendCode() {
    if (resendCooldown > 0) return;
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Could not resend code.");
        return;
      }
      setMessage("A new code has been sent to your email.");
      setResendCooldown(45);
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setAuthBusy(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Could not send reset code.");
        setAuthBusy(false);
        return;
      }
      setMode("reset");
      setResetCooldown(45);
      setMessage("If an account exists for that email, we've sent a reset code.");
    } catch {
      setError("Network error. Please try again.");
    }
    setAuthBusy(false);
  }

  async function handleResendReset() {
    if (resetCooldown > 0) return;
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Could not resend code.");
        return;
      }
      setMessage("A new reset code has been sent.");
      setResetCooldown(45);
    } catch {
      setError("Network error. Please try again.");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setAuthBusy(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code: resetCode, newPassword })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Could not reset password.");
        setAuthBusy(false);
        return;
      }
      setMode("login");
      setEmail(forgotEmail);
      setPassword("");
      setResetCode("");
      setNewPassword("");
      setForgotEmail("");
      setMessage("Password reset. Please log in with your new password.");
    } catch {
      setError("Network error. Please try again.");
    }
    setAuthBusy(false);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    const country = findCountry(profileCountryCode);
    const digits = onlyDigits(profilePhone);
    if (digits.length !== country.digits) {
      setError(`Enter a valid ${country.name} phone number (${country.digits} digits, no country code).`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          phone: digits,
          countryCode: profileCountryCode,
          address,
          deliveryArea,
          notes,
          avatarUrl
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Could not save.");
        setSaving(false);
        return;
      }
      setCustomer(data.customer);
      fillProfile(data.customer);
      setMessage("Profile saved.");
      setView("dashboard");
    } catch {
      setError("Network error. Please try again.");
    }
    setSaving(false);
  }

  async function pickDefaultAvatar(url: string) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("defaultAvatar", url);
      const res = await fetch("/api/auth/avatar", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setAvatarUrl(data.avatarUrl);
        setCustomer((c) => (c ? { ...c, avatarUrl: data.avatarUrl } : c));
        setMessage("Photo updated.");
      } else {
        setError(data.message || "Could not update photo.");
      }
    } catch {
      setError("Could not update photo.");
    }
    setUploading(false);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/auth/avatar", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        setAvatarUrl(data.avatarUrl);
        setCustomer((c) => (c ? { ...c, avatarUrl: data.avatarUrl } : c));
        setMessage("Photo uploaded.");
      } else {
        setError(data.message || "Upload failed.");
      }
    } catch {
      setError("Upload failed.");
    }
    setUploading(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setCustomer(null);
    setOrders([]);
    setView("dashboard");
    setMessage("Logged out.");
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-sm text-ink-muted">
        Loading...
      </div>
    );
  }

  // ---------- Auth screens ----------
  if (!customer) {
    // ---- Email verification (OTP) screen ----
    if (mode === "verify") {
      return (
        <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-plum/10 flex items-center justify-center mx-auto mb-4">
              <User size={28} className="text-plum" />
            </div>
            <h1 className="text-2xl font-medium text-plum mb-1">Verify your email</h1>
            <p className="text-sm text-ink-muted">
              Enter the 6-digit code we sent to <span className="font-medium text-plum">{verifyEmail}</span>.
            </p>
          </div>

          <form
            onSubmit={handleVerify}
            className="bg-white border border-cream-soft rounded-2xl p-6 shadow-sm space-y-3"
          >
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Verification code</label>
              <input
                required
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(onlyDigits(e.target.value).slice(0, 6))}
                className="w-full text-center tracking-[0.5em] text-lg font-medium rounded-xl border border-cream-soft px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-berry/30"
                placeholder="000000"
              />
            </div>

            {error && <p className="text-sm text-[#A32D2D]">{error}</p>}
            {message && <p className="text-sm text-[#1E7A6E]">{message}</p>}

            <button
              type="submit"
              disabled={authBusy || verifyCode.length !== 6}
              className="w-full bg-plum text-cream text-sm font-medium py-3 rounded-xl disabled:opacity-60 mt-1"
            >
              {authBusy ? "Verifying..." : "Verify & continue"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-5">
            Didn&apos;t get it?{" "}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown > 0}
              className="text-berry-dark font-medium disabled:opacity-50"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
            </button>
          </p>
          <p className="text-center text-sm text-ink-muted mt-2">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              className="text-ink-muted underline"
            >
              Back to log in
            </button>
          </p>
        </div>
      );
    }

    if (mode === "forgot") {
      return (
        <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-plum/10 flex items-center justify-center mx-auto mb-4">
              <User size={28} className="text-plum" />
            </div>
            <h1 className="text-2xl font-medium text-plum mb-1">Reset your password</h1>
            <p className="text-sm text-ink-muted">
              Enter your account email and we&apos;ll send you a reset code.
            </p>
          </div>

          <form
            onSubmit={handleForgotPassword}
            className="bg-white border border-cream-soft rounded-2xl p-6 shadow-sm space-y-3"
          >
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Email</label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-berry/30"
                placeholder="you@email.com"
              />
            </div>

            {error && <p className="text-sm text-[#A32D2D]">{error}</p>}
            {message && <p className="text-sm text-[#1E7A6E]">{message}</p>}

            <button
              type="submit"
              disabled={authBusy}
              className="w-full bg-plum text-cream text-sm font-medium py-3 rounded-xl disabled:opacity-60 mt-1"
            >
              {authBusy ? "Sending..." : "Send reset code"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-5">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              className="text-ink-muted underline"
            >
              Back to log in
            </button>
          </p>
        </div>
      );
    }

    if (mode === "reset") {
      return (
        <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-plum/10 flex items-center justify-center mx-auto mb-4">
              <User size={28} className="text-plum" />
            </div>
            <h1 className="text-2xl font-medium text-plum mb-1">Enter reset code</h1>
            <p className="text-sm text-ink-muted">
              Enter the 6-digit code sent to <span className="font-medium text-plum">{forgotEmail}</span>{" "}
              and choose a new password.
            </p>
          </div>

          <form
            onSubmit={handleResetPassword}
            className="bg-white border border-cream-soft rounded-2xl p-6 shadow-sm space-y-3"
          >
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Reset code</label>
              <input
                required
                inputMode="numeric"
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(onlyDigits(e.target.value).slice(0, 6))}
                className="w-full text-center tracking-[0.5em] text-lg font-medium rounded-xl border border-cream-soft px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-berry/30"
                placeholder="000000"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">New password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-berry/30"
                placeholder="At least 6 characters"
              />
            </div>

            {error && <p className="text-sm text-[#A32D2D]">{error}</p>}
            {message && <p className="text-sm text-[#1E7A6E]">{message}</p>}

            <button
              type="submit"
              disabled={authBusy || resetCode.length !== 6}
              className="w-full bg-plum text-cream text-sm font-medium py-3 rounded-xl disabled:opacity-60 mt-1"
            >
              {authBusy ? "Saving..." : "Reset password"}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-5">
            Didn&apos;t get it?{" "}
            <button
              type="button"
              onClick={handleResendReset}
              disabled={resetCooldown > 0}
              className="text-berry-dark font-medium disabled:opacity-50"
            >
              {resetCooldown > 0 ? `Resend in ${resetCooldown}s` : "Resend code"}
            </button>
          </p>
          <p className="text-center text-sm text-ink-muted mt-2">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              className="text-ink-muted underline"
            >
              Back to log in
            </button>
          </p>
        </div>
      );
    }

    const signupCountry = findCountry(countryCode);

    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-plum/10 flex items-center justify-center mx-auto mb-4">
            <User size={28} className="text-plum" />
          </div>
          <h1 className="text-2xl font-medium text-plum mb-1">
            {mode === "login" ? "Welcome back" : "Join Maccha Bazar"}
          </h1>
          <p className="text-sm text-ink-muted">
            {mode === "login"
              ? "Log in to see your cart, orders and delivery details."
              : "Create an account for faster WhatsApp orders."}
          </p>
        </div>

        <form
          onSubmit={handleAuth}
          className="bg-white border border-cream-soft rounded-2xl p-6 shadow-sm space-y-3"
        >
          {mode === "signup" && (
            <>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Full name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-berry/30"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Phone</label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="text-sm rounded-xl border border-cream-soft px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-berry/30 bg-white"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    required
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(onlyDigits(e.target.value).slice(0, signupCountry.digits))}
                    className="flex-1 min-w-0 text-sm rounded-xl border border-cream-soft px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-berry/30"
                    placeholder={"9".repeat(signupCountry.digits)}
                  />
                </div>
                <p className="text-[11px] text-ink-muted mt-1">
                  Enter a {signupCountry.digits}-digit {signupCountry.name} number, without the country
                  code.
                </p>
              </div>
            </>
          )}
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-berry/30"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-berry/30"
              placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
            />
            {mode === "login" && (
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setMode("forgot");
                  setError("");
                  setMessage("");
                }}
                className="text-xs text-berry-dark font-medium mt-1.5"
              >
                Forgot password?
              </button>
            )}
          </div>

          {error && <p className="text-sm text-[#A32D2D]">{error}</p>}
          {message && <p className="text-sm text-[#1E7A6E]">{message}</p>}

          <button
            type="submit"
            disabled={authBusy}
            className="w-full bg-plum text-cream text-sm font-medium py-3 rounded-xl disabled:opacity-60 mt-1"
          >
            {authBusy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-5">
          {mode === "login" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setMessage("");
                }}
                className="text-berry-dark font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
                className="text-berry-dark font-medium"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    );
  }

  // ---------- Profile edit view ----------
  if (view === "profile") {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <button
          type="button"
          onClick={() => setView("dashboard")}
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-plum mb-5"
        >
          <ArrowLeft size={16} />
          Back to account
        </button>

        <h1 className="text-xl font-medium text-plum mb-1">Edit profile</h1>
        <p className="text-sm text-ink-muted mb-6">Photo, contact and delivery details.</p>

        {/* Avatar */}
        <div className="bg-white border border-cream-soft rounded-2xl p-5 mb-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl || DEFAULT_AVATARS[0]}
            alt=""
            className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-cream-soft bg-cream-soft mb-3"
          />
          <p className="text-xs text-ink-muted mb-3">Choose a default photo or upload your own</p>
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {DEFAULT_AVATARS.map((src) => (
              <button
                key={src}
                type="button"
                disabled={uploading}
                onClick={() => pickDefaultAvatar(src)}
                className={`rounded-full p-0.5 border-2 transition ${
                  avatarUrl === src ? "border-berry" : "border-transparent hover:border-cream-soft"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="w-11 h-11 rounded-full" />
              </button>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 text-sm font-medium text-plum border border-cream-soft rounded-xl px-4 py-2 hover:border-berry disabled:opacity-60"
          >
            <Camera size={16} />
            {uploading ? "Uploading..." : "Upload photo"}
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="bg-white border border-cream-soft rounded-2xl p-5 space-y-3">
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Full name</label>
            <input
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Phone</label>
            <div className="flex gap-2">
              <select
                value={profileCountryCode}
                onChange={(e) => setProfileCountryCode(e.target.value)}
                className="text-sm rounded-xl border border-cream-soft px-2 py-2.5 bg-white"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dial}
                  </option>
                ))}
              </select>
              <input
                inputMode="numeric"
                value={profilePhone}
                onChange={(e) =>
                  setProfilePhone(onlyDigits(e.target.value).slice(0, findCountry(profileCountryCode).digits))
                }
                className="flex-1 min-w-0 text-sm rounded-xl border border-cream-soft px-3.5 py-2.5"
              />
            </div>
            <p className="text-[11px] text-ink-muted mt-1">
              {findCountry(profileCountryCode).digits}-digit {findCountry(profileCountryCode).name}{" "}
              number, without the country code.
            </p>
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Email</label>
            <input
              value={customer.email}
              disabled
              className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5 bg-cream-soft/50 text-ink-muted"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Delivery area</label>
            <input
              value={deliveryArea}
              onChange={(e) => setDeliveryArea(e.target.value)}
              placeholder="Kathmandu, Lalitpur, Bhaktapur..."
              className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Full address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Street, landmark, house no."
              className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5"
            />
          </div>

          {error && <p className="text-sm text-[#A32D2D]">{error}</p>}
          {message && <p className="text-sm text-[#1E7A6E]">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-plum text-cream text-sm font-medium py-3 rounded-xl disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </div>
    );
  }

  // ---------- Dashboard ----------
  const photo = customer.avatarUrl || DEFAULT_AVATARS[0];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      {/* Hero profile card */}
      <div className="relative overflow-hidden rounded-2xl bg-plum text-cream p-6">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-cream/5" />
        <div className="absolute -right-4 bottom-0 w-20 h-20 rounded-full bg-amber/10" />
        <div className="relative flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt=""
            className="w-16 h-16 rounded-full object-cover border-2 border-cream/30 bg-cream/10 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-medium truncate">{customer.name || "Your account"}</h1>
            <p className="text-sm text-cream/60 truncate">{customer.email}</p>
            {customer.phone && (
              <p className="text-xs text-cream/50 mt-0.5">
                {customer.phoneCountryCode || "+977"} {customer.phone}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex-shrink-0 flex items-center gap-1 text-xs text-cream/70 hover:text-cream"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setError("");
            setView("profile");
          }}
          className="relative mt-4 inline-flex items-center gap-2 text-sm font-medium bg-cream/10 hover:bg-cream/15 text-cream rounded-xl px-4 py-2"
        >
          <Pencil size={14} />
          Edit profile & photo
        </button>
      </div>

      {message && (
        <p className="text-sm text-[#1E7A6E] bg-[#E8F5F2] rounded-xl px-4 py-2.5">{message}</p>
      )}
      {error && (
        <p className="text-sm text-[#A32D2D] bg-[#FCEAEA] rounded-xl px-4 py-2.5">{error}</p>
      )}

      {/* Delivery summary */}
      <section className="bg-white border border-cream-soft rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-berry-dark" />
            <h2 className="text-sm font-medium text-plum">Delivery details</h2>
          </div>
          <button
            type="button"
            onClick={() => setView("profile")}
            className="text-xs text-berry-dark font-medium"
          >
            Edit
          </button>
        </div>
        {customer.address || customer.deliveryArea ? (
          <p className="text-sm text-ink-muted leading-relaxed">
            {customer.deliveryArea && (
              <span className="inline-block text-[11px] font-medium bg-cream-soft text-plum px-2 py-0.5 rounded-full mr-2 mb-1">
                {customer.deliveryArea}
              </span>
            )}
            <br />
            {customer.address || "Address not set yet."}
          </p>
        ) : (
          <p className="text-sm text-ink-muted">
            No delivery address yet.{" "}
            <button type="button" onClick={() => setView("profile")} className="text-berry-dark font-medium">
              Add now
            </button>
          </p>
        )}
      </section>

      {/* Cart */}
      <section className="bg-white border border-cream-soft rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-berry-dark" />
            <h2 className="text-sm font-medium text-plum">
              Cart {totalItems > 0 ? `(${totalItems})` : ""}
            </h2>
          </div>
          {totalItems > 0 && (
            <button type="button" onClick={openCart} className="text-xs font-medium text-berry-dark">
              Checkout
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-6">
            <Package size={28} className="mx-auto text-ink-muted/50 mb-2" />
            <p className="text-sm text-ink-muted mb-3">Your cart is empty.</p>
            <Link
              href="/shop"
              className="inline-block text-sm font-medium bg-berry hover:bg-berry-dark text-berry-text rounded-xl px-5 py-2.5"
            >
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-3 items-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/icons/fish-placeholder.svg"}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover bg-cream-soft flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-plum truncate">{item.name}</div>
                  <div className="text-xs text-ink-muted">
                    {item.variantName} · Rs. {item.price}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg border border-cream-soft text-xs"
                  >
                    −
                  </button>
                  <span className="text-xs w-5 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg border border-cream-soft text-xs"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="text-[11px] text-ink-muted hover:text-[#A32D2D]"
                >
                  ✕
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-cream-soft">
              <span className="text-sm font-medium text-plum">Total</span>
              <span className="text-sm font-medium text-plum">Rs. {totalPrice}</span>
            </div>
            <button
              type="button"
              onClick={openCart}
              className="w-full text-sm font-medium bg-berry hover:bg-berry-dark text-berry-text rounded-xl py-3"
            >
              Order via WhatsApp
            </button>
          </div>
        )}
      </section>

      {/* Order history */}
      <section className="bg-white border border-cream-soft rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-berry-dark" />
          <h2 className="text-sm font-medium text-plum">Order history</h2>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-ink-muted text-center py-4">
            No orders yet. When you checkout via WhatsApp, they will show up here.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="rounded-xl bg-cream-soft/60 px-4 py-3">
                <div className="flex justify-between gap-2 mb-1.5">
                  <span className="text-sm font-medium text-plum">
                    Rs. {o.totalPrice}
                    <span className="text-xs font-normal text-ink-muted ml-1.5">
                      · {o.itemCount} item{o.itemCount === 1 ? "" : "s"}
                    </span>
                  </span>
                  <span className="text-[11px] text-ink-muted">{formatDate(o.createdAt)}</span>
                </div>
                <ul className="text-xs text-ink-muted space-y-0.5">
                  {o.items.map((item, i) => (
                    <li key={i}>
                      {item.name} ({item.variantName}) × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="text-center pt-2">
        <Link href="/shop" className="text-sm text-berry-dark font-medium hover:underline">
          Continue shopping →
        </Link>
      </div>
    </div>
  );
}
