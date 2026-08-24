"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  comingSoon: boolean;
  sortOrder: number;
};

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function ComingSoonPage() {
  const [all, setAll] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const comingSoon = all.filter((c) => c.comingSoon);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => { setAll(d); setLoading(false); });
  }, []);

  function flash(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        slug: slugify(newName.trim()),
        description: "Coming soon.",
        active: false,
        comingSoon: true,
        sortOrder: all.length + 1,
      }),
    });
    if (res.ok) {
      const newCat = await res.json();
      setAll((p) => [...p, newCat]);
      setNewName("");
      setShowAdd(false);
      flash("Added!");
    } else {
      flash("Error adding.");
    }
    setSaving(false);
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Remove "${cat.name}" from coming soon? This will delete the category.`)) return;
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    if (res.ok) {
      setAll((p) => p.filter((c) => c.id !== cat.id));
      flash("Removed!");
    } else {
      flash("Error removing.");
    }
  }

  async function toggleVisible(cat: Category) {
    // Toggle comingSoon off = make it active (live), or hide it
    const updated = { ...cat, comingSoon: !cat.comingSoon, active: cat.comingSoon ? true : false };
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      setAll((p) => p.map((c) => (c.id === cat.id ? updated : c)));
      flash(updated.comingSoon ? "Moved to coming soon." : "Made live!");
    }
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-plum">Coming Soon</h1>
          <p className="text-sm text-ink-muted">Manage items shown in the "More coming soon" section on the homepage.</p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setNewName(""); }}
          className="flex items-center gap-2 bg-plum text-cream text-sm px-4 py-2 rounded-lg"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {msg && <p className="text-sm text-berry-dark mb-4">{msg}</p>}

      {showAdd && (
        <div className="bg-white border border-cream-soft rounded-xl p-4 mb-4 flex gap-2 items-center">
          <input
            className="flex-1 border border-cream-soft rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. Aquarium Plants, Fish Food, Shrimp..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            className="bg-plum text-cream text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add"}
          </button>
          <button
            onClick={() => setShowAdd(false)}
            className="text-sm px-3 py-2 rounded-lg border border-cream-soft text-ink-muted"
          >
            Cancel
          </button>
        </div>
      )}

      {comingSoon.length === 0 ? (
        <div className="bg-white border border-cream-soft rounded-xl p-8 text-center text-sm text-ink-muted">
          No coming soon items yet. Click &quot;Add&quot; to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {comingSoon.map((cat) => (
            <div key={cat.id} className="bg-white border border-cream-soft rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-plum">{cat.name}</p>
                <p className="text-xs text-ink-muted">/{cat.slug}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleVisible(cat)}
                  title="Make live (removes from coming soon)"
                  className="p-2 rounded-lg hover:bg-cream-soft text-ink-muted"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  title="Delete this category"
                  className="p-2 rounded-lg hover:bg-cream-soft text-red-400"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-amber/10 border border-amber/20 rounded-xl p-4 text-xs text-ink-muted space-y-1">
        <p className="font-medium text-plum text-sm">How this works</p>
        <p>• <strong>Add</strong> — creates a new "Coming Soon" category that shows on homepage.</p>
        <p>• <strong>Eye icon</strong> — makes the category live (removes from coming soon, shows in shop).</p>
        <p>• <strong>Delete (trash)</strong> — permanently removes the category.</p>
        <p>• Default items like <strong>Aquarium Plants</strong> and <strong>Fish Food</strong> are already seeded in your database via Categories.</p>
      </div>
    </div>
  );
}
