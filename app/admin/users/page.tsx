"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X, ShieldCheck } from "lucide-react";
import type { AdminUser } from "@/lib/types";

const emptyForm = {
  username: "",
  password: "",
  products: true,
  content: false,
  users: false
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      setUsers(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.username.trim()) {
      setError("Enter a username.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.username.trim(),
        password: form.password,
        permissions: { products: form.products, content: form.content, users: form.users }
      })
    });
    if (res.ok) {
      setForm(emptyForm);
      setShowForm(false);
      load();
    } else {
      const data = await res.json();
      setError(data.message || "Could not create user.");
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-plum">Users</h1>
          <p className="text-sm text-ink-muted">Give staff their own admin login with specific permissions.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-berry hover:bg-berry-dark text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? "Close" : "Add user"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white border border-cream-soft rounded-xl p-5 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
          </div>
          <div>
            <p className="text-xs text-ink-muted mb-2">Permissions</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.products}
                  onChange={(e) => setForm({ ...form, products: e.target.checked })}
                />
                Manage products (add, edit, delete, stock, photos)
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.checked })}
                />
                Manage settings & banner (business info, homepage banner)
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.users}
                  onChange={(e) => setForm({ ...form, users: e.target.checked })}
                />
                Manage users (add/remove other admin logins)
              </label>
            </div>
          </div>
          {error && <p className="text-xs text-[#A32D2D]">{error}</p>}
          <button type="submit" className="bg-plum text-cream text-sm font-medium px-4 py-2 rounded-lg">
            Create user
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading users...</p>
      ) : (
        <div className="bg-white border border-cream-soft rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-muted border-b border-cream-soft">
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Access</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-cream-soft last:border-0">
                  <td className="px-4 py-3 text-plum">{u.username}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {u.isOwner ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-dark">
                        <ShieldCheck size={13} /> Owner (full access)
                      </span>
                    ) : (
                      <span className="text-xs">
                        {[u.permissions.products && "Products", u.permissions.content && "Settings", u.permissions.users && "Users"]
                          .filter(Boolean)
                          .join(", ") || "No permissions"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!u.isOwner && (
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-ink-muted hover:text-[#A32D2D]"
                        aria-label={`Remove ${u.username}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
