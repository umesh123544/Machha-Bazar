"use client";
import { useEffect, useState } from "react";
import ImageUploader from "@/components/ImageUploader";

const PAGES = [
  { id: "about", label: "About Us" },
  { id: "care-guide", label: "Care Guide" },
  { id: "contact", label: "Contact" },
];

type PageState = { title: string; content: string; image: string };

export default function AdminPagesPage() {
  const [activeId, setActiveId] = useState("about");
  const [contents, setContents] = useState<Record<string, PageState>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function fetchAll() {
      const results = await Promise.all(
        PAGES.map((p) =>
          fetch(`/api/admin/pages/${p.id}`).then((r) => r.json())
        )
      );
      const map: Record<string, PageState> = {};
      PAGES.forEach((p, i) => {
        map[p.id] = {
          title: results[i].title || "",
          content: results[i].content || "",
          image: results[i].image || ""
        };
      });
      setContents(map);
      setLoading(false);
    }
    fetchAll();
  }, []);

  async function handleSave() {
    setSaving(true);
    const current = contents[activeId];
    const res = await fetch(`/api/admin/pages/${activeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(current),
    });
    if (res.ok) {
      setMsg("Saved!");
    } else {
      setMsg("Error saving");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  function update(field: keyof PageState, value: string) {
    setContents((prev) => ({
      ...prev,
      [activeId]: { ...prev[activeId], [field]: value },
    }));
  }

  // Care guide: work with up to 3 separate paragraphs, joined by a blank line in storage.
  function getParagraphs(content: string): string[] {
    const parts = content.split("\n\n");
    while (parts.length < 3) parts.push("");
    return parts.slice(0, 3);
  }

  function updateParagraph(index: number, value: string) {
    const current = contents[activeId];
    if (!current) return;
    const parts = getParagraphs(current.content);
    parts[index] = value;
    update("content", parts.join("\n\n"));
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading...</p>;

  const current = contents[activeId];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-medium text-plum">Page Content</h1>
        <p className="text-sm text-ink-muted">Edit About, Care Guide, and Contact page image, title and text</p>
      </div>

      {/* Page tabs */}
      <div className="flex gap-2 mb-6">
        {PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className={`text-sm px-4 py-2 rounded-full ${
              activeId === p.id
                ? "bg-plum text-cream"
                : "bg-cream-soft text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {current && (
        <div className="bg-white border border-cream-soft rounded-xl p-4 space-y-4 max-w-2xl">
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Page image</label>
            <ImageUploader value={current.image} onChange={(url) => update("image", url)} scope="banner" />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Page Title</label>
            <input
              className="w-full border border-cream-soft rounded-lg px-3 py-2 text-sm"
              value={current.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          {activeId === "care-guide" ? (
            <div className="space-y-3">
              <label className="text-xs text-ink-muted block">Paragraphs (up to 3)</label>
              {getParagraphs(current.content).map((para, i) => (
                <div key={i}>
                  <label className="text-[11px] text-ink-muted mb-1 block">Paragraph {i + 1}</label>
                  <textarea
                    className="w-full border border-cream-soft rounded-lg px-3 py-2 text-sm min-h-[100px] resize-y"
                    value={para}
                    onChange={(e) => updateParagraph(i, e.target.value)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <label className="text-xs text-ink-muted mb-1 block">
                Content (each paragraph = new line)
              </label>
              <textarea
                className="w-full border border-cream-soft rounded-lg px-3 py-2 text-sm min-h-[300px] resize-y"
                value={current.content}
                onChange={(e) => update("content", e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-plum text-cream text-sm px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {msg && <p className="text-sm text-berry-dark">{msg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
