"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  comingSoon: boolean;
  sortOrder: number;
};

const empty = (): Omit<Category, "id"> => ({
  name: "",
  slug: "",
  description: "",
  active: true,
  comingSoon: false,
  sortOrder: 0,
});

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty());
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => { setCategories(d); setLoading(false); });
  }, []);

  function slugify(name: string) {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleAdd() {
    setSaving(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newCat = await res.json();
      setCategories((p) => [...p, newCat]);
      setForm(empty());
      setShowAdd(false);
      setMsg("Category added!");
    } else {
      const e = await res.json();
      setMsg(e.message || "Error");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setCategories((p) => p.map((c) => (c.id === id ? { ...c, ...form } : c)));
      setEditingId(null);
      setMsg("Saved!");
    } else {
      setMsg("Error saving");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((p) => p.filter((c) => c.id !== id));
      setMsg("Deleted!");
      setTimeout(() => setMsg(""), 3000);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      active: cat.active,
      comingSoon: cat.comingSoon,
      sortOrder: cat.sortOrder,
    });
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-plum">Categories</h1>
          <p className="text-sm text-ink-muted">Manage shop categories</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setForm(empty()); }}
          className="flex items-center gap-2 bg-plum text-cream text-sm px-4 py-2 rounded-lg"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {msg && <p className="text-sm text-berry-dark mb-4">{msg}</p>}

      {showAdd && (
        <div className="bg-white border border-cream-soft rounded-xl p-4 mb-4 space-y-3">
          <p className="text-sm font-medium text-plum">New Category</p>
          <input
            className="w-full border border-cream-soft rounded-lg px-3 py-2 text-sm"
            placeholder="Name (e.g. Goldfish)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))}
          />
          <input
            className="w-full border border-cream-soft rounded-lg px-3 py-2 text-sm"
            placeholder="Slug (e.g. goldfish)"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />
          <input
            className="w-full border border-cream-soft rounded-lg px-3 py-2 text-sm"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <input
            className="w-full border border-cream-soft rounded-lg px-3 py-2 text-sm"
            placeholder="Sort order (0, 1, 2...)"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
          />
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Active
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.comingSoon} onChange={(e) => setForm((f) => ({ ...f, comingSoon: e.target.checked }))} />
              Coming Soon
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !form.name}
              className="bg-plum text-cream text-sm px-4 py-2 rounded-lg disabled:opacity-50">
              {saving ? "Saving..." : "Add Category"}
            </button>
            <button onClick={() => setShowAdd(false)}
              className="text-sm px-4 py-2 rounded-lg border border-cream-soft">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-cream-soft rounded-xl p-4">
            {editingId === cat.id ? (
              <div className="space-y-3">
                <input className="w-full border border-cream-soft rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                <input className="w-full border border-cream-soft rounded-lg px-3 py-2 text-sm" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                <input className="w-full border border-cream-soft rounded-lg px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                <input className="w-full border border-cream-soft rounded-lg px-3 py-2 text-sm" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                    Active
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.comingSoon} onChange={(e) => setForm((f) => ({ ...f, comingSoon: e.target.checked }))} />
                    Coming Soon
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(cat.id)} disabled={saving}
                    className="flex items-center gap-1 bg-plum text-cream text-sm px-3 py-1.5 rounded-lg">
                    <Check size={14} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-cream-soft">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-plum">{cat.name}</p>
                  <p className="text-xs text-ink-muted">/{cat.slug} · {cat.active ? "Active" : "Inactive"}{cat.comingSoon ? " · Coming soon" : ""}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(cat)} className="p-2 rounded-lg hover:bg-cream-soft text-ink-muted">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg hover:bg-cream-soft text-red-400">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
