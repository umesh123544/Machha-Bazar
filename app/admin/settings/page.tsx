"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";
import ImageUploader from "@/components/ImageUploader";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Saved. Changes are live on the site now.");
    } else {
      setError("Could not save. Make sure you are logged in and have content access.");
    }
  }

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  }

  if (loading || !settings) {
    return <p className="text-sm text-ink-muted">Loading settings...</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-plum">Settings & Banner</h1>
        <p className="text-sm text-ink-muted">Control the homepage banner, business info, and delivery details.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <section className="bg-white border border-cream-soft rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-medium text-plum mb-1">Homepage banner</h2>
          <ImageUploader value={settings.bannerImage} onChange={(url) => update("bannerImage", url)} scope="banner" />
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Small badge text</label>
            <input
              value={settings.bannerBadge}
              onChange={(e) => update("bannerBadge", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              placeholder="Kathmandu Valley delivery"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Headline</label>
            <input
              value={settings.bannerHeadline}
              onChange={(e) => update("bannerHeadline", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              placeholder="Bring home something beautiful."
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Subheading</label>
            <input
              value={settings.bannerSubheading}
              onChange={(e) => update("bannerSubheading", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              placeholder="Healthy, carefully raised aquarium fish for your home."
            />
          </div>
        </section>

        <section className="bg-white border border-cream-soft rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-medium text-plum mb-1">Business info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Business name</label>
              <input
                value={settings.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Tagline</label>
              <input
                value={settings.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">WhatsApp number (no + or spaces)</label>
              <input
                value={settings.whatsappNumber}
                onChange={(e) => update("whatsappNumber", e.target.value)}
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Phone</label>
              <input
                value={settings.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Email</label>
              <input
                value={settings.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Business hours</label>
              <input
                value={settings.businessHours}
                onChange={(e) => update("businessHours", e.target.value)}
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Address</label>
            <input
              value={settings.address}
              onChange={(e) => update("address", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
          </div>
        </section>

        <section className="bg-white border border-cream-soft rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-medium text-plum mb-1">Delivery</h2>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Delivery areas (comma separated)</label>
            <input
              value={settings.deliveryAreas.join(", ")}
              onChange={(e) => update("deliveryAreas", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Delivery note</label>
            <textarea
              value={settings.deliveryNote}
              onChange={(e) => update("deliveryNote", e.target.value)}
              rows={2}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
          </div>
        </section>

        <section className="bg-white border border-cream-soft rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-medium text-plum mb-1">Social links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Facebook URL</label>
              <input
                value={settings.facebookUrl}
                onChange={(e) => update("facebookUrl", e.target.value)}
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Instagram URL</label>
              <input
                value={settings.instagramUrl}
                onChange={(e) => update("instagramUrl", e.target.value)}
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
          </div>
        </section>

        {message && <p className="text-sm text-[#1E7A6E]">{message}</p>}
        {error && <p className="text-sm text-[#A32D2D]">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-plum text-cream text-sm font-medium px-6 py-2.5 rounded-lg disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
