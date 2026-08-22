"use client";

import { useEffect, useState } from "react";
import type { OfferSettings, SiteSettings } from "@/lib/types";
import ImageUploader from "@/components/ImageUploader";
import { Tag } from "lucide-react";

const DEFAULT: OfferSettings = {
  enabled: false,
  title: "Limited time offer",
  subtitle: "Special deals on selected aquarium fish — order before time runs out.",
  badge: "OFFER",
  ctaText: "Shop the offer",
  ctaLink: "/shop",
  endsAt: "",
  image: "",
  template: "gradient"
};

const TEMPLATE_OPTIONS: { key: OfferSettings["template"]; label: string; desc: string }[] = [
  { key: "gradient", label: "Gradient", desc: "Rich dark gradient card with countdown + photo." },
  { key: "minimal", label: "Minimal", desc: "Clean light card, no heavy decoration." },
  { key: "ribbon", label: "Ribbon", desc: "Bold diagonal corner ribbon, playful sale look." },
  { key: "split", label: "Split", desc: "Photo one side, offer details the other." },
  { key: "ticket", label: "Ticket", desc: "Coupon-style with a dashed perforated divider." },
  { key: "bar", label: "Bar", desc: "Slim inline strip — least intrusive." }
];

const DURATION_PRESETS = [
  { label: "1 दिन (1 day)", days: 1 },
  { label: "3 दिन (3 days)", days: 3 },
  { label: "1 हप्ता (1 week)", days: 7 },
  { label: "2 हप्ता (2 weeks)", days: 14 },
  { label: "1 महिना (1 month)", days: 30 }
];

function toLocalInputValue(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // datetime-local expects local wall time
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(local: string) {
  if (!local) return "";
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

function formatNepal(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-NP", {
      timeZone: "Asia/Kathmandu",
      dateStyle: "full",
      timeStyle: "short"
    });
  } catch {
    return iso;
  }
}

export default function AdminOffersPage() {
  const [offer, setOffer] = useState<OfferSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: SiteSettings) => {
        setOffer({ ...DEFAULT, ...(data.offer || {}) });
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load settings.");
        setLoading(false);
      });
  }, []);

  function update<K extends keyof OfferSettings>(key: K, value: OfferSettings[K]) {
    setOffer((prev) => ({ ...prev, [key]: value }));
  }

  function applyDuration(days: number) {
    const end = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    update("endsAt", end.toISOString());
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer })
      });
      if (!res.ok) {
        setError("Could not save. Check login / content permission.");
        setSaving(false);
        return;
      }
      const data = await res.json();
      if (data.offer) setOffer({ ...DEFAULT, ...data.offer });
      setMessage("Offer saved. Live on the homepage when enabled and not expired.");
    } catch {
      setError("Network error.");
    }
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-ink-muted">Loading offer settings...</p>;

  const expired =
    offer.endsAt && !Number.isNaN(new Date(offer.endsAt).getTime())
      ? new Date(offer.endsAt).getTime() < Date.now()
      : false;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-medium text-plum flex items-center gap-2">
          <Tag size={20} className="text-berry-dark" />
          Offers
        </h1>
        <p className="text-sm text-ink-muted">
          Catchy homepage offer banner with countdown. Time uses Nepal (Asia/Kathmandu). When the
          timer ends, the banner hides automatically.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <section className="bg-white border border-cream-soft rounded-xl p-5 space-y-4">
          <label className="flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <div className="text-sm font-medium text-plum">Show offer on website</div>
              <div className="text-[11px] text-ink-muted">
                Off = fully hidden. On = visible until end time (if set).
              </div>
            </div>
            <input
              type="checkbox"
              checked={offer.enabled}
              onChange={(e) => update("enabled", e.target.checked)}
              className="w-5 h-5 rounded border-cream-soft"
            />
          </label>

          {offer.enabled && expired && (
            <p className="text-xs text-[#A32D2D] bg-[#FCEAEA] rounded-lg px-3 py-2">
              End time is already past — banner will stay hidden until you extend the time.
            </p>
          )}

          <div>
            <label className="text-xs text-ink-muted mb-2 block">Banner style</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TEMPLATE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => update("template", opt.key)}
                  className={`text-left border rounded-lg p-2.5 ${
                    offer.template === opt.key ? "border-berry ring-1 ring-berry" : "border-cream-soft"
                  }`}
                >
                  <div className="text-xs font-medium text-plum">{opt.label}</div>
                  <div className="text-[10px] text-ink-muted leading-snug mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-ink-muted mb-1 block">Badge (small label)</label>
            <input
              value={offer.badge}
              onChange={(e) => update("badge", e.target.value)}
              placeholder="OFFER / 20% OFF / FLASH SALE"
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Title</label>
            <input
              value={offer.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Subtitle</label>
            <textarea
              value={offer.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              rows={2}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Button text</label>
              <input
                value={offer.ctaText}
                onChange={(e) => update("ctaText", e.target.value)}
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Button link</label>
              <input
                value={offer.ctaLink}
                onChange={(e) => update("ctaLink", e.target.value)}
                placeholder="/shop"
                className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-1 block">Offer image (optional)</label>
            <ImageUploader value={offer.image} onChange={(url) => update("image", url)} scope="banner" />
          </div>
        </section>

        <section className="bg-white border border-cream-soft rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-medium text-plum">Offer duration (Nepal time)</h2>
          <p className="text-[11px] text-ink-muted -mt-2">
            Quick pick sets end time from now. Example: 1 हप्ता = banner disappears after 7 days.
            Countdown on the site uses Nepal (Kathmandu) time.
          </p>

          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => applyDuration(p.days)}
                className="text-xs font-medium border border-cream-soft rounded-full px-3 py-1.5 text-plum hover:border-berry"
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => update("endsAt", "")}
              className="text-xs font-medium border border-cream-soft rounded-full px-3 py-1.5 text-ink-muted hover:border-berry"
            >
              No end date
            </button>
          </div>

          <div>
            <label className="text-xs text-ink-muted mb-1 block">Custom end date & time</label>
            <input
              type="datetime-local"
              value={toLocalInputValue(offer.endsAt)}
              onChange={(e) => update("endsAt", fromLocalInputValue(e.target.value))}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
            <p className="text-[11px] text-ink-muted mt-1.5">
              Nepal time end: <strong className="text-plum">{formatNepal(offer.endsAt)}</strong>
            </p>
          </div>
        </section>

        {message && <p className="text-sm text-[#1E7A6E]">{message}</p>}
        {error && <p className="text-sm text-[#A32D2D]">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-plum text-cream text-sm font-medium px-6 py-2.5 rounded-lg disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save offer"}
        </button>
      </form>
    </div>
  );
}
