"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut, ShoppingCart, MapPin, Package } from "lucide-react";
import { useCart } from "@/lib/cart-context";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  deliveryArea: string;
  notes: string;
};

export default function AccountPage() {
  const { items, totalItems, totalPrice, openCart, removeItem, updateQuantity } = useCart();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  // auth form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // profile form
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          setCustomer(data.customer);
          fillProfile(data.customer);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function fillProfile(c: Customer) {
    setProfileName(c.name || "");
    setProfilePhone(c.phone || "");
    setAddress(c.address || "");
    setDeliveryArea(c.deliveryArea || "");
    setNotes(c.notes || "");
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setAuthBusy(true);
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const body =
      mode === "login"
        ? { email, password }
        : { email, password, name, phone };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Something went wrong.");
        setAuthBusy(false);
        return;
      }
      setCustomer(data.customer);
      fillProfile(data.customer);
      setMessage(mode === "login" ? "Logged in successfully." : "Account created. Welcome!");
      setPassword("");
    } catch {
      setError("Network error. Please try again.");
    }
    setAuthBusy(false);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          address,
          deliveryArea,
          notes
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Could not save.");
        setSaving(false);
        return;
      }
      setCustomer(data.customer);
      setMessage("Profile saved.");
    } catch {
      setError("Network error. Please try again.");
    }
    setSaving(false);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setCustomer(null);
    setMessage("Logged out.");
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center text-sm text-ink-muted">
        Loading...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-6">
          <User size={36} className="mx-auto text-berry-dark mb-3" />
          <h1 className="text-xl font-medium text-plum mb-1">
            {mode === "login" ? "Log in" : "Create account"}
          </h1>
          <p className="text-sm text-ink-muted">
            Save your details for faster WhatsApp orders.
          </p>
        </div>

        <form onSubmit={handleAuth} className="bg-white border border-cream-soft rounded-xl p-5 space-y-3">
          {mode === "signup" && (
            <>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Full name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Phone</label>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
                  placeholder="98XXXXXXXX"
                />
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
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
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
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
            />
          </div>

          {error && <p className="text-sm text-[#A32D2D]">{error}</p>}
          {message && <p className="text-sm text-[#1E7A6E]">{message}</p>}

          <button
            type="submit"
            disabled={authBusy}
            className="w-full bg-plum text-cream text-sm font-medium py-2.5 rounded-lg disabled:opacity-60"
          >
            {authBusy ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-4">
          {mode === "login" ? (
            <>
              No account?{" "}
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-plum">Hello, {customer.name || "there"}</h1>
          <p className="text-sm text-ink-muted">{customer.email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-plum"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>

      {message && <p className="text-sm text-[#1E7A6E]">{message}</p>}
      {error && <p className="text-sm text-[#A32D2D]">{error}</p>}

      {/* Profile / delivery details */}
      <section className="bg-white border border-cream-soft rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-berry-dark" />
          <h2 className="text-sm font-medium text-plum">Your details & delivery</h2>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Full name</label>
              <input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Phone</label>
              <input
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Delivery area</label>
            <input
              value={deliveryArea}
              onChange={(e) => setDeliveryArea(e.target.value)}
              placeholder="e.g. Kathmandu, Lalitpur, Bhaktapur"
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Full delivery address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Street, landmark, house no."
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any delivery notes"
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-plum text-cream text-sm font-medium px-5 py-2.5 rounded-lg disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save details"}
          </button>
        </form>
      </section>

      {/* Cart */}
      <section className="bg-white border border-cream-soft rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-berry-dark" />
            <h2 className="text-sm font-medium text-plum">
              Your cart {totalItems > 0 ? `(${totalItems})` : ""}
            </h2>
          </div>
          {totalItems > 0 && (
            <button
              type="button"
              onClick={openCart}
              className="text-xs font-medium text-berry-dark"
            >
              Open cart drawer
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-6">
            <Package size={28} className="mx-auto text-ink-muted mb-2" />
            <p className="text-sm text-ink-muted mb-3">Your cart is empty.</p>
            <Link
              href="/shop"
              className="inline-block text-sm font-medium bg-berry hover:bg-berry-dark text-berry-text rounded-lg px-5 py-2.5"
            >
              Browse shop
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-3 items-center border-b border-cream-soft pb-3 last:border-0 last:pb-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/icons/fish-placeholder.svg"}
                  alt={item.name}
                  className="w-14 h-14 rounded-lg object-cover bg-cream-soft flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-plum truncate">{item.name}</div>
                  <div className="text-xs text-ink-muted">
                    {item.variantName} · Rs. {item.price}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                      className="w-6 h-6 rounded border border-cream-soft text-xs"
                    >
                      −
                    </button>
                    <span className="text-xs w-5 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                      className="w-6 h-6 rounded border border-cream-soft text-xs"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId, item.variantId)}
                      className="text-[11px] text-ink-muted ml-2 hover:text-[#A32D2D]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-sm font-medium text-plum flex-shrink-0">
                  Rs. {item.price * item.quantity}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-plum">Total</span>
              <span className="text-sm font-medium text-plum">Rs. {totalPrice}</span>
            </div>
            <button
              type="button"
              onClick={openCart}
              className="w-full text-sm font-medium bg-berry hover:bg-berry-dark text-berry-text rounded-lg py-2.5"
            >
              Order via WhatsApp
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
