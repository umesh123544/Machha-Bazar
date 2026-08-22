"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SiteSettings, HomepageWhyItem, HomepageStep, BannerSlide } from "@/lib/types";
import ImageUploader from "@/components/ImageUploader";
import { FONT_OPTIONS } from "@/lib/fonts";

const ICON_OPTIONS = ["Egg", "Fish", "Camera", "Truck", "Heart", "ShieldCheck", "Leaf", "Star", "Droplet", "Sparkles"];

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

  function updateHomepage<K extends keyof SiteSettings["homepageContent"]>(
    key: K,
    value: SiteSettings["homepageContent"][K]
  ) {
    if (!settings) return;
    setSettings({ ...settings, homepageContent: { ...settings.homepageContent, [key]: value } });
  }

  function updateWhyItem(index: number, patch: Partial<HomepageWhyItem>) {
    if (!settings) return;
    const whyItems = settings.homepageContent.whyItems.map((item, i) => (i === index ? { ...item, ...patch } : item));
    updateHomepage("whyItems", whyItems);
  }

  function addWhyItem() {
    if (!settings) return;
    updateHomepage("whyItems", [...settings.homepageContent.whyItems, { icon: "Fish", title: "", desc: "" }]);
  }

  function removeWhyItem(index: number) {
    if (!settings) return;
    updateHomepage("whyItems", settings.homepageContent.whyItems.filter((_, i) => i !== index));
  }

  function updateStep(index: number, patch: Partial<HomepageStep>) {
    if (!settings) return;
    const steps = settings.homepageContent.steps.map((step, i) => (i === index ? { ...step, ...patch } : step));
    updateHomepage("steps", steps);
  }

  function addStep() {
    if (!settings) return;
    updateHomepage("steps", [...settings.homepageContent.steps, { title: "", desc: "" }]);
  }

  function removeStep(index: number) {
    if (!settings) return;
    updateHomepage("steps", settings.homepageContent.steps.filter((_, i) => i !== index));
  }

  function updateSlide(index: number, patch: Partial<BannerSlide>) {
    if (!settings) return;
    const slides = settings.bannerSlides.map((s, i) => (i === index ? { ...s, ...patch } : s));
    update("bannerSlides", slides);
  }

  function addSlide() {
    if (!settings || settings.bannerSlides.length >= 5) return;
    const newSlide: BannerSlide = {
      id: `slide-${Date.now()}`,
      image: "",
      badge: "",
      headline: "",
      subheading: ""
    };
    update("bannerSlides", [...settings.bannerSlides, newSlide]);
  }

  function removeSlide(index: number) {
    if (!settings) return;
    update("bannerSlides", settings.bannerSlides.filter((_, i) => i !== index));
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
          <h2 className="text-sm font-medium text-plum mb-1">Logo</h2>
          <p className="text-[11px] text-ink-muted -mt-2 mb-1">
            Upload a logo to show it instead of the plain business name in the header and footer. Remove the image to fall back to text.
          </p>
          <div className="max-w-xs">
            <ImageUploader value={settings.logoUrl} onChange={(url) => update("logoUrl", url)} scope="logo" />
          </div>
          <div>
            <label className="text-xs text-ink-muted mb-2 block">Logo size</label>
            <div className="flex gap-2">
              {(["small", "medium", "large"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => update("logoSize", size)}
                  className={`flex-1 flex flex-col items-center gap-1.5 border rounded-lg py-3 capitalize text-xs font-medium text-plum ${
                    settings.logoSize === size ? "border-berry ring-1 ring-berry" : "border-cream-soft"
                  }`}
                >
                  <span
                    className="bg-plum/80 rounded-sm"
                    style={{
                      height: size === "small" ? 14 : size === "large" ? 26 : 20,
                      width: size === "small" ? 28 : size === "large" ? 52 : 40
                    }}
                  />
                  {size}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border border-cream-soft rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-medium text-plum mb-1">Homepage banner</h2>
          <div>
            <label className="text-xs text-ink-muted mb-2 block">Banner layout</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => update("bannerTemplate", "classic")}
                className={`text-left border rounded-lg p-3 ${
                  settings.bannerTemplate === "classic" ? "border-berry ring-1 ring-berry" : "border-cream-soft"
                }`}
              >
                <div className="h-14 rounded-md bg-plum mb-2 flex items-center px-2">
                  <div className="w-2/3 space-y-1">
                    <div className="h-1.5 w-1/2 bg-amber/70 rounded-full" />
                    <div className="h-2 w-full bg-cream/80 rounded-full" />
                  </div>
                </div>
                <div className="text-xs font-medium text-plum">Classic</div>
                <div className="text-[11px] text-ink-muted">Full photo, text over a dark overlay.</div>
              </button>
              <button
                type="button"
                onClick={() => update("bannerTemplate", "split")}
                className={`text-left border rounded-lg p-3 ${
                  settings.bannerTemplate === "split" ? "border-berry ring-1 ring-berry" : "border-cream-soft"
                }`}
              >
                <div className="h-14 rounded-md bg-cream-soft mb-2 flex overflow-hidden">
                  <div className="w-1/2 flex flex-col justify-center gap-1 px-2">
                    <div className="h-1.5 w-3/4 bg-plum/70 rounded-full" />
                    <div className="h-2 w-full bg-plum/40 rounded-full" />
                  </div>
                  <div className="w-1/2 bg-plum" />
                </div>
                <div className="text-xs font-medium text-plum">Split</div>
                <div className="text-[11px] text-ink-muted">Photo one side, text on the other.</div>
              </button>
              <button
                type="button"
                onClick={() => update("bannerTemplate", "centered")}
                className={`text-left border rounded-lg p-3 ${
                  settings.bannerTemplate === "centered" ? "border-berry ring-1 ring-berry" : "border-cream-soft"
                }`}
              >
                <div className="h-14 rounded-md bg-plum mb-2 flex flex-col items-center justify-center gap-1">
                  <div className="h-1.5 w-1/3 bg-amber/70 rounded-full" />
                  <div className="h-2 w-2/3 bg-cream/80 rounded-full" />
                </div>
                <div className="text-xs font-medium text-plum">Centered</div>
                <div className="text-[11px] text-ink-muted">Center-aligned headline over photo.</div>
              </button>
              <button
                type="button"
                onClick={() => update("bannerTemplate", "card")}
                className={`text-left border rounded-lg p-3 ${
                  settings.bannerTemplate === "card" ? "border-berry ring-1 ring-berry" : "border-cream-soft"
                }`}
              >
                <div className="h-14 rounded-md bg-berry/10 mb-2 flex items-center gap-1.5 p-1.5">
                  <div className="w-2/5 space-y-1 pl-0.5">
                    <div className="h-1.5 w-3/4 bg-plum/70 rounded-full" />
                    <div className="h-1.5 w-1/2 bg-plum/40 rounded-full" />
                  </div>
                  <div className="w-3/5 h-full bg-plum rounded-md shadow-sm" />
                </div>
                <div className="text-xs font-medium text-plum">Card</div>
                <div className="text-[11px] text-ink-muted">Floating photo card, e-commerce style.</div>
              </button>
              <button
                type="button"
                onClick={() => update("bannerTemplate", "gradient")}
                className={`text-left border rounded-lg p-3 ${
                  settings.bannerTemplate === "gradient" ? "border-berry ring-1 ring-berry" : "border-cream-soft"
                }`}
              >
                <div
                  className="h-14 rounded-md mb-2 flex flex-col items-center justify-center gap-1"
                  style={{ background: "linear-gradient(135deg, #2B1B33 0%, #A34068 100%)" }}
                >
                  <div className="h-1.5 w-1/3 bg-white/60 rounded-full" />
                  <div className="h-2 w-2/3 bg-white/90 rounded-full" />
                </div>
                <div className="text-xs font-medium text-plum">Gradient</div>
                <div className="text-[11px] text-ink-muted">Bold color gradient, no photo needed.</div>
              </button>
              <button
                type="button"
                onClick={() => update("bannerTemplate", "carousel")}
                className={`text-left border rounded-lg p-3 ${
                  settings.bannerTemplate === "carousel" ? "border-berry ring-1 ring-berry" : "border-cream-soft"
                }`}
              >
                <div className="h-14 rounded-md bg-plum mb-2 flex items-center justify-center gap-1 relative px-2">
                  <div className="w-2/3 space-y-1">
                    <div className="h-1.5 w-1/2 bg-amber/70 rounded-full" />
                    <div className="h-2 w-full bg-cream/80 rounded-full" />
                  </div>
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    <div className="h-1 w-3 rounded-full bg-cream" />
                    <div className="h-1 w-1 rounded-full bg-cream/40" />
                    <div className="h-1 w-1 rounded-full bg-cream/40" />
                  </div>
                </div>
                <div className="text-xs font-medium text-plum">Carousel (swipe)</div>
                <div className="text-[11px] text-ink-muted">Up to 5 slides, swipe or auto-advance.</div>
              </button>
            </div>
          </div>

          {settings.bannerTemplate === "carousel" ? (
            <div className="space-y-3 pt-2">
              <p className="text-[11px] text-ink-muted">
                Add up to 5 slides. Each slide can have its own photo, badge, headline and subheading. Visitors can swipe between them, and they auto-advance every few seconds.
              </p>
              {settings.bannerSlides.map((slide, i) => (
                <div key={slide.id} className="border border-cream-soft rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-plum">Slide {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeSlide(i)}
                      className="text-ink-muted hover:text-[#A32D2D] p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <ImageUploader value={slide.image} onChange={(url) => updateSlide(i, { image: url })} scope="banner" />
                  <input
                    className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2"
                    placeholder="Small badge text (optional)"
                    value={slide.badge}
                    onChange={(e) => updateSlide(i, { badge: e.target.value })}
                  />
                  <input
                    className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2"
                    placeholder="Headline"
                    value={slide.headline}
                    onChange={(e) => updateSlide(i, { headline: e.target.value })}
                  />
                  <textarea
                    className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2"
                    placeholder="Subheading (optional)"
                    rows={2}
                    value={slide.subheading}
                    onChange={(e) => updateSlide(i, { subheading: e.target.value })}
                  />
                </div>
              ))}
              {settings.bannerSlides.length < 5 && (
                <button
                  type="button"
                  onClick={addSlide}
                  className="flex items-center gap-1 text-xs font-medium text-berry-dark"
                >
                  <Plus size={14} /> Add slide ({settings.bannerSlides.length}/5)
                </button>
              )}
              {settings.bannerSlides.length === 0 && (
                <p className="text-[11px] text-[#A32D2D]">Add at least one slide, or the classic banner will show instead.</p>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
        </section>

        <section className="bg-white border border-cream-soft rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-medium text-plum mb-1">Look & feel</h2>
          <p className="text-[11px] text-ink-muted -mt-2">
            Changes apply across the whole site — header, buttons, badges, and admin panel.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Primary color</label>
              <p className="text-[11px] text-ink-muted mb-2">Header, footer, dark backgrounds &amp; text</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-cream-soft cursor-pointer p-0.5 bg-white"
                />
                <input
                  value={settings.primaryColor}
                  onChange={(e) => update("primaryColor", e.target.value)}
                  className="flex-1 text-sm rounded-lg border border-cream-soft px-3 py-2 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Accent color</label>
              <p className="text-[11px] text-ink-muted mb-2">Buttons, links &amp; call-to-actions</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => update("accentColor", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-cream-soft cursor-pointer p-0.5 bg-white"
                />
                <input
                  value={settings.accentColor}
                  onChange={(e) => update("accentColor", e.target.value)}
                  className="flex-1 text-sm rounded-lg border border-cream-soft px-3 py-2 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-ink-muted mb-1 block">Highlight color</label>
              <p className="text-[11px] text-ink-muted mb-2">Badges &amp; small highlights</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.highlightColor}
                  onChange={(e) => update("highlightColor", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-cream-soft cursor-pointer p-0.5 bg-white"
                />
                <input
                  value={settings.highlightColor}
                  onChange={(e) => update("highlightColor", e.target.value)}
                  className="flex-1 text-sm rounded-lg border border-cream-soft px-3 py-2 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-cream-soft pt-4">
            <label className="text-xs text-ink-muted mb-2 block">Site font</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => update("siteFont", f.name)}
                  className={`text-left border rounded-lg px-3 py-2.5 ${
                    settings.siteFont === f.name ? "border-berry ring-1 ring-berry" : "border-cream-soft"
                  }`}
                >
                  <div className="text-sm text-plum" style={{ fontFamily: f.stack }}>{f.name}</div>
                  <div className="text-[10px] text-ink-muted">{f.preview}</div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border border-cream-soft rounded-xl p-5 space-y-5">
          <h2 className="text-sm font-medium text-plum mb-1">Homepage sections</h2>

          <div>
            <label className="text-xs text-ink-muted mb-1 block">&quot;Available now&quot; section title</label>
            <input
              value={settings.homepageContent.availableTitle}
              onChange={(e) => updateHomepage("availableTitle", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5 mb-2"
            />
            <label className="text-xs text-ink-muted mb-1 block">Subtitle</label>
            <input
              value={settings.homepageContent.availableSubtitle}
              onChange={(e) => updateHomepage("availableSubtitle", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
            <p className="text-[11px] text-ink-muted mt-1">
              Mark products as &quot;Featured&quot; in Products to control which ones show here.
            </p>
          </div>

          <div className="border-t border-cream-soft pt-4">
            <label className="text-xs text-ink-muted mb-1 block">&quot;Why choose us&quot; title</label>
            <input
              value={settings.homepageContent.whyTitle}
              onChange={(e) => updateHomepage("whyTitle", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5 mb-3"
            />
            <div className="space-y-3">
              {settings.homepageContent.whyItems.map((item, i) => (
                <div key={i} className="border border-cream-soft rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={item.icon}
                      onChange={(e) => updateWhyItem(i, { icon: e.target.value })}
                      className="text-sm rounded-lg border border-cream-soft px-2 py-2"
                    >
                      {ICON_OPTIONS.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                    <input
                      value={item.title}
                      onChange={(e) => updateWhyItem(i, { title: e.target.value })}
                      placeholder="Title"
                      className="flex-1 text-sm rounded-lg border border-cream-soft px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeWhyItem(i)}
                      className="text-ink-muted hover:text-[#A32D2D] p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    value={item.desc}
                    onChange={(e) => updateWhyItem(i, { desc: e.target.value })}
                    placeholder="Description"
                    rows={2}
                    className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addWhyItem}
              className="flex items-center gap-1 text-xs font-medium text-berry-dark mt-2"
            >
              <Plus size={14} /> Add item
            </button>
          </div>

          <div className="border-t border-cream-soft pt-4">
            <label className="text-xs text-ink-muted mb-1 block">&quot;How to order&quot; title</label>
            <input
              value={settings.homepageContent.howToOrderTitle}
              onChange={(e) => updateHomepage("howToOrderTitle", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5 mb-3"
            />
            <div className="space-y-3">
              {settings.homepageContent.steps.map((step, i) => (
                <div key={i} className="border border-cream-soft rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ink-muted w-6">{String(i + 1).padStart(2, "0")}</span>
                    <input
                      value={step.title}
                      onChange={(e) => updateStep(i, { title: e.target.value })}
                      placeholder="Step title"
                      className="flex-1 text-sm rounded-lg border border-cream-soft px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeStep(i)}
                      className="text-ink-muted hover:text-[#A32D2D] p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea
                    value={step.desc}
                    onChange={(e) => updateStep(i, { desc: e.target.value })}
                    placeholder="Step description"
                    rows={2}
                    className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addStep}
              className="flex items-center gap-1 text-xs font-medium text-berry-dark mt-2"
            >
              <Plus size={14} /> Add step
            </button>
          </div>

          <div className="border-t border-cream-soft pt-4">
            <label className="text-xs text-ink-muted mb-1 block">Delivery section title</label>
            <input
              value={settings.homepageContent.deliveryTitle}
              onChange={(e) => updateHomepage("deliveryTitle", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
            <p className="text-[11px] text-ink-muted mt-1">
              Delivery areas and note are edited in the Delivery section below.
            </p>
          </div>

          <div className="border-t border-cream-soft pt-4">
            <label className="text-xs text-ink-muted mb-1 block">&quot;More coming soon&quot; title</label>
            <input
              value={settings.homepageContent.comingSoonTitle}
              onChange={(e) => updateHomepage("comingSoonTitle", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
            />
            <p className="text-[11px] text-ink-muted mt-1">
              This section auto-fills from categories marked &quot;Coming soon&quot; in Categories.
            </p>
          </div>

          <div className="border-t border-cream-soft pt-4">
            <label className="text-xs text-ink-muted mb-1 block">Bottom call-to-action title</label>
            <input
              value={settings.homepageContent.ctaTitle}
              onChange={(e) => updateHomepage("ctaTitle", e.target.value)}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5 mb-2"
            />
            <label className="text-xs text-ink-muted mb-1 block">Call-to-action subtitle</label>
            <textarea
              value={settings.homepageContent.ctaSubtitle}
              onChange={(e) => updateHomepage("ctaSubtitle", e.target.value)}
              rows={2}
              className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5"
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
          <h2 className="text-sm font-medium text-plum mb-1">Page visibility</h2>
          <p className="text-[11px] text-ink-muted -mt-2">
            Show or hide About and Delivery pages on the public site. Content is kept even when hidden.
          </p>
          <label className="flex items-center gap-3 text-sm text-plum cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showAboutPage !== false}
              onChange={(e) => update("showAboutPage", e.target.checked)}
              className="rounded border-cream-soft"
            />
            Show About page
          </label>
          <label className="flex items-center gap-3 text-sm text-plum cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showDeliveryPage !== false}
              onChange={(e) => update("showDeliveryPage", e.target.checked)}
              className="rounded border-cream-soft"
            />
            Show Delivery page
          </label>
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
