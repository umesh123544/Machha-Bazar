"use client";

import { useEffect, useState } from "react";
import { Users, ShoppingBag, ChevronDown, ChevronUp, Phone, Mail, MapPin, Plus, Trash2, X } from "lucide-react";
import { COUNTRIES, DEFAULT_COUNTRY, findCountry, onlyDigits } from "@/lib/countries";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  emailVerified?: boolean;
  address: string;
  deliveryArea: string;
  notes: string;
  createdAt: string;
  lastLoginAt: string | null;
  orderCount: number;
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
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  deliveryArea: string;
  items: OrderItem[];
  totalPrice: number;
  itemCount: number;
  createdAt: string;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-NP", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return iso;
  }
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"customers" | "orders">("customers");
  const [showAdd, setShowAdd] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState("");
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addCountryCode, setAddCountryCode] = useState(DEFAULT_COUNTRY.code);
  const [addAddress, setAddAddress] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function loadCustomers() {
    setLoading(true);
    fetch("/api/admin/customers")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load");
        }
        return res.json();
      })
      .then((data) => {
        setCustomers(data.customers || []);
        setRecentOrders(data.recentOrders || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Could not load customers.");
        setLoading(false);
      });
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  async function handleAddCustomer(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddBusy(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          password: addPassword,
          phone: addPhone,
          countryCode: addCountryCode,
          address: addAddress
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.message || "Could not add customer.");
        setAddBusy(false);
        return;
      }
      setShowAdd(false);
      setAddName("");
      setAddEmail("");
      setAddPassword("");
      setAddPhone("");
      setAddAddress("");
      setAddCountryCode(DEFAULT_COUNTRY.code);
      loadCustomers();
    } catch {
      setAddError("Network error. Please try again.");
    }
    setAddBusy(false);
  }

  async function handleDeleteCustomer(id: string, name: string) {
    if (!confirm(`Delete customer "${name || "this customer"}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/customers?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Could not delete customer.");
        setDeletingId(null);
        return;
      }
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      alert("Network error. Please try again.");
    }
    setDeletingId(null);
  }

  if (loading) {
    return <p className="text-sm text-ink-muted">Loading customers...</p>;
  }

  if (error) {
    return (
      <div className="max-w-xl">
        <h1 className="text-xl font-medium text-plum mb-2">Customers</h1>
        <p className="text-sm text-[#A32D2D] mb-2">{error}</p>
        <p className="text-xs text-ink-muted">
          Make sure you ran <code className="bg-cream-soft px-1 rounded">migration_8.sql</code> in
          Supabase SQL Editor.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-plum">Customers</h1>
          <p className="text-sm text-ink-muted">
            Who signed up, their contact details, and WhatsApp order activity.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-plum text-cream flex-shrink-0"
        >
          <Plus size={14} />
          Add customer
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-plum">Add customer</h2>
              <button type="button" onClick={() => setShowAdd(false)} className="text-ink-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-3">
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Full name</label>
                <input
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Email</label>
                <input
                  type="email"
                  required
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Phone (optional)</label>
                <div className="flex gap-2">
                  <select
                    value={addCountryCode}
                    onChange={(e) => setAddCountryCode(e.target.value)}
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
                    value={addPhone}
                    onChange={(e) =>
                      setAddPhone(onlyDigits(e.target.value).slice(0, findCountry(addCountryCode).digits))
                    }
                    className="flex-1 min-w-0 text-sm rounded-xl border border-cream-soft px-3.5 py-2.5"
                    placeholder={"9".repeat(findCountry(addCountryCode).digits)}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-ink-muted mb-1 block">Address (optional)</label>
                <input
                  value={addAddress}
                  onChange={(e) => setAddAddress(e.target.value)}
                  className="w-full text-sm rounded-xl border border-cream-soft px-3.5 py-2.5"
                />
              </div>

              {addError && <p className="text-sm text-[#A32D2D]">{addError}</p>}

              <button
                type="submit"
                disabled={addBusy}
                className="w-full bg-plum text-cream text-sm font-medium py-3 rounded-xl disabled:opacity-60 mt-1"
              >
                {addBusy ? "Adding..." : "Add customer"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setTab("customers")}
          className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full ${
            tab === "customers" ? "bg-plum text-cream" : "bg-cream-soft text-ink"
          }`}
        >
          <Users size={14} />
          Customers ({customers.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("orders")}
          className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-full ${
            tab === "orders" ? "bg-plum text-cream" : "bg-cream-soft text-ink"
          }`}
        >
          <ShoppingBag size={14} />
          Orders ({recentOrders.length})
        </button>
      </div>

      {tab === "customers" && (
        <div className="space-y-3">
          {customers.length === 0 ? (
            <p className="text-sm text-ink-muted bg-white border border-cream-soft rounded-xl p-6 text-center">
              No customers have signed up yet.
            </p>
          ) : (
            customers.map((c) => {
              const open = expandedId === c.id;
              return (
                <div key={c.id} className="bg-white border border-cream-soft rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : c.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cream-soft/40"
                  >
                    {c.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-cream-soft" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-plum/10 text-plum flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {(c.name || c.email || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-plum truncate flex items-center gap-1.5">
                        {c.name || "No name"}
                        {c.emailVerified ? (
                          <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-[#1E7A6E]/10 text-[#1E7A6E] flex-shrink-0">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-[#A32D2D]/10 text-[#A32D2D] flex-shrink-0">
                            Not verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-ink-muted truncate">
                        {c.email}
                        {c.phone ? ` · ${c.phone}` : ""}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className="text-xs text-ink-muted">
                        {c.orderCount} order{c.orderCount === 1 ? "" : "s"}
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        Login: {formatDate(c.lastLoginAt)}
                      </div>
                    </div>
                    {open ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
                  </button>
                  {open && (
                    <div className="px-4 pb-4 border-t border-cream-soft pt-3 space-y-2 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-start gap-2 text-ink-muted">
                          <Phone size={14} className="mt-0.5 flex-shrink-0" />
                          <span>{c.phone || "—"}</span>
                        </div>
                        <div className="flex items-start gap-2 text-ink-muted">
                          <Mail size={14} className="mt-0.5 flex-shrink-0" />
                          <span className="break-all">{c.email}</span>
                        </div>
                        <div className="flex items-start gap-2 text-ink-muted sm:col-span-2">
                          <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                          <span>
                            {c.deliveryArea ? `${c.deliveryArea} — ` : ""}
                            {c.address || "No address saved"}
                          </span>
                        </div>
                      </div>
                      {c.notes && (
                        <p className="text-xs text-ink-muted bg-cream-soft rounded-lg px-3 py-2">
                          Notes: {c.notes}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-[11px] text-ink-muted pt-1">
                        <span>Signed up: {formatDate(c.createdAt)}</span>
                        <span>Last login: {formatDate(c.lastLoginAt)}</span>
                        <span>
                          Orders: {c.orderCount}
                        </span>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomer(c.id, c.name)}
                          disabled={deletingId === c.id}
                          className="flex items-center gap-1.5 text-xs text-[#A32D2D] font-medium px-3 py-1.5 rounded-lg border border-[#A32D2D]/30 hover:bg-[#A32D2D]/5 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                          {deletingId === c.id ? "Deleting..." : "Delete customer"}
                        </button>
                      </div>
                      {c.orderCount > 0 && (
                        <div className="pt-2 space-y-2">
                          <div className="text-xs font-medium text-plum">Their orders</div>
                          {recentOrders
                            .filter((o) => o.customerId === c.id)
                            .map((o) => (
                              <div
                                key={o.id}
                                className="text-xs bg-cream-soft rounded-lg px-3 py-2"
                              >
                                <div className="flex justify-between gap-2 mb-1">
                                  <span className="font-medium text-plum">
                                    Rs. {o.totalPrice} · {o.itemCount} item(s)
                                  </span>
                                  <span className="text-ink-muted">{formatDate(o.createdAt)}</span>
                                </div>
                                <ul className="text-ink-muted space-y-0.5">
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
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-3">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-ink-muted bg-white border border-cream-soft rounded-xl p-6 text-center">
              No WhatsApp checkout activity logged yet. Orders appear when a customer taps
              &quot;Checkout via WhatsApp&quot;.
            </p>
          ) : (
            recentOrders.map((o) => (
              <div key={o.id} className="bg-white border border-cream-soft rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-medium text-plum">
                      {o.customerName || "Guest"}{" "}
                      {!o.customerId && (
                        <span className="text-[10px] font-normal text-ink-muted bg-cream-soft px-1.5 py-0.5 rounded">
                          not logged in
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink-muted">
                      {[o.customerPhone, o.customerEmail].filter(Boolean).join(" · ") || "No contact"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-plum">Rs. {o.totalPrice}</div>
                    <div className="text-[11px] text-ink-muted">{formatDate(o.createdAt)}</div>
                  </div>
                </div>
                {(o.customerAddress || o.deliveryArea) && (
                  <p className="text-xs text-ink-muted mb-2">
                    {o.deliveryArea ? `${o.deliveryArea} — ` : ""}
                    {o.customerAddress}
                  </p>
                )}
                <ul className="text-xs text-ink-muted space-y-0.5 border-t border-cream-soft pt-2">
                  {o.items.map((item, i) => (
                    <li key={i}>
                      {item.name} ({item.variantName}) × {item.quantity} — Rs.{" "}
                      {item.price * item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
