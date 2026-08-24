"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Clock, Tag, ArrowRight } from "lucide-react";
import type { OfferSettings } from "@/lib/types";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function getParts(endsAt: string): Parts | null {
  if (!endsAt) return null;
  const end = new Date(endsAt).getTime();
  if (Number.isNaN(end)) return null;
  const diff = end - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Format end time in Nepal (Asia/Kathmandu). */
function formatNepalEnd(endsAt: string) {
  try {
    return new Date(endsAt).toLocaleString("en-NP", {
      timeZone: "Asia/Kathmandu",
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return endsAt;
  }
}

// Ticks on its own, once a second, and only re-renders this small subtree.
// Earlier this state lived on the parent OfferBanner, so every tick re-rendered
// the whole card — including the blurred decorative layers and background
// photo — which made scrolling/swiping feel janky while an offer was live.
const Countdown = memo(function Countdown({ endsAt, tone }: { endsAt: string; tone: "dark" | "light" }) {
  const [parts, setParts] = useState<Parts | null>(() => getParts(endsAt));

  useEffect(() => {
    setParts(getParts(endsAt));
    const id = setInterval(() => setParts(getParts(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!parts) return null;

  const boxClass =
    tone === "dark"
      ? "min-w-[50px] rounded-lg bg-black/30 border border-white/10 backdrop-blur px-2 py-1.5 text-center"
      : "min-w-[50px] rounded-lg bg-plum/5 border border-plum/10 px-2 py-1.5 text-center";
  const valueClass = tone === "dark" ? "text-amber" : "text-berry-dark";
  const labelClass = tone === "dark" ? "text-cream/55" : "text-ink-muted";
  return (
    <div className="flex flex-wrap gap-2">
      {(
        [
          { label: "Days", value: parts.days },
          { label: "Hrs", value: parts.hours },
          { label: "Min", value: parts.minutes },
          { label: "Sec", value: parts.seconds }
        ] as const
      ).map((box) => (
        <div key={box.label} className={boxClass}>
          <div className={`text-lg font-semibold tabular-nums leading-none ${valueClass}`}>{pad(box.value)}</div>
          <div className={`text-[9px] uppercase tracking-wide mt-1 ${labelClass}`}>{box.label}</div>
        </div>
      ))}
    </div>
  );
});

// Same idea as Countdown above, but the compact inline text used by the "bar" template.
const InlineCountdown = memo(function InlineCountdown({ endsAt }: { endsAt: string }) {
  const [parts, setParts] = useState<Parts | null>(() => getParts(endsAt));

  useEffect(() => {
    setParts(getParts(endsAt));
    const id = setInterval(() => setParts(getParts(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!parts) return null;

  return (
    <span className="text-xs text-cream/70 tabular-nums">
      {pad(parts.days)}d {pad(parts.hours)}h {pad(parts.minutes)}m {pad(parts.seconds)}s left
    </span>
  );
});

function PhotoBlock({
  image,
  className,
  iconSize = 40
}: {
  image: string;
  className: string;
  iconSize?: number;
}) {
  return (
    <div
      className={`bg-cover bg-center relative overflow-hidden flex-shrink-0 ${className}`}
      style={
        image
          ? { backgroundImage: `url(${image})` }
          : { background: "linear-gradient(135deg, rgba(240,184,76,0.35), rgba(214,94,140,0.3))" }
      }
    >
      {!image && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="text-amber/60" size={iconSize} />
        </div>
      )}
    </div>
  );
}

export default function OfferBanner({ offer }: { offer: OfferSettings }) {
  // Only tracks whether the offer has ENDED — flips (at most) once, via a single
  // timeout fired exactly at the end time, instead of polling every second.
  // Per-second ticking now lives entirely inside Countdown/InlineCountdown below,
  // so this parent (and its blurred/background-image decoration) doesn't
  // re-render every tick.
  const [hasEnded, setHasEnded] = useState(() => !!offer.endsAt && getParts(offer.endsAt) === null);

  useEffect(() => {
    if (!offer.endsAt) {
      setHasEnded(false);
      return;
    }
    const msLeft = new Date(offer.endsAt).getTime() - Date.now();
    setHasEnded(msLeft <= 0);
    if (msLeft <= 0) return;
    const id = setTimeout(() => setHasEnded(true), msLeft);
    return () => clearTimeout(id);
  }, [offer.endsAt]);

  const active = useMemo(() => {
    if (!offer.enabled) return false;
    if (!offer.endsAt) return true; // no end = show until manually hidden
    return !hasEnded;
  }, [offer.enabled, offer.endsAt, hasEnded]);

  if (!active) return null;

  const endsLine = offer.endsAt ? `Ends ${formatNepalEnd(offer.endsAt)} (Nepal time)` : "";

  // ---- Minimal: clean light card, small square photo beside the text ----
  if (offer.template === "minimal") {
    return (
      <div className="rounded-2xl border border-berry/20 bg-berry/5 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <PhotoBlock image={offer.image} className="w-full h-40 sm:h-auto sm:w-56" iconSize={36} />
          <div className="flex-1 p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase bg-plum text-cream px-2.5 py-1 rounded-md">
                {offer.badge || "OFFER"}
              </span>
              <h2 className="text-xl sm:text-2xl font-medium text-plum">{offer.title || "Limited time offer"}</h2>
              {offer.subtitle && <p className="text-sm text-ink-muted max-w-md">{offer.subtitle}</p>}
              {endsLine && <p className="text-xs text-berry-dark">{endsLine}</p>}
            </div>
            <Link
              href={offer.ctaLink || "/shop"}
              className="inline-flex items-center justify-center gap-2 bg-berry hover:bg-berry-dark text-berry-text text-sm font-medium px-6 py-3 rounded-lg transition-colors flex-shrink-0"
            >
              {offer.ctaText || "Shop now"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- Ribbon: full photo background, bold diagonal corner ribbon ----
  if (offer.template === "ribbon") {
    return (
      <div
        className="relative overflow-hidden rounded-2xl bg-plum text-cream bg-cover bg-center"
        style={
          offer.image
            ? { backgroundImage: `linear-gradient(rgba(20,10,25,0.45), rgba(20,10,25,0.75)), url(${offer.image})` }
            : undefined
        }
      >
        <div className="absolute -right-12 top-5 w-44 rotate-45 bg-amber text-plum text-[11px] font-bold uppercase tracking-wider text-center py-1 shadow-md z-10">
          {offer.badge || "OFFER"}
        </div>
        <div className="p-5 sm:p-8 pr-16 sm:pr-24 relative">
          <h2 className="text-xl sm:text-2xl font-medium mb-2 max-w-md">{offer.title || "Limited time offer"}</h2>
          {offer.subtitle && <p className="text-sm text-cream/70 max-w-md mb-4">{offer.subtitle}</p>}
          {offer.endsAt && <div className="mb-4"><Countdown endsAt={offer.endsAt} tone="dark" /></div>}
          <Link
            href={offer.ctaLink || "/shop"}
            className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-plum text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {offer.ctaText || "Shop now"}
          </Link>
        </div>
        {!offer.image && <Sparkles className="absolute -right-4 -bottom-6 text-amber/10" size={160} aria-hidden />}
      </div>
    );
  }

  // ---- Split: photo one side, offer details the other (always visible, all screens) ----
  if (offer.template === "split") {
    return (
      <div className="rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 border border-cream-soft shadow-sm">
        <div className="bg-plum text-cream px-6 sm:px-8 py-8 sm:py-10 flex flex-col justify-center order-2 sm:order-1">
          <span className="inline-flex w-fit items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase bg-amber text-plum px-2.5 py-1 rounded-md mb-4">
            {offer.badge || "OFFER"}
          </span>
          <h2 className="text-xl sm:text-2xl font-medium mb-2">{offer.title || "Limited time offer"}</h2>
          {offer.subtitle && <p className="text-sm text-cream/70 mb-4">{offer.subtitle}</p>}
          {offer.endsAt && <div className="mb-5"><Countdown endsAt={offer.endsAt} tone="dark" /></div>}
          <Link
            href={offer.ctaLink || "/shop"}
            className="inline-flex w-fit items-center gap-2 bg-berry hover:bg-berry-dark text-berry-text text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {offer.ctaText || "Shop now"}
          </Link>
        </div>
        <PhotoBlock image={offer.image} className="min-h-[180px] sm:min-h-0 order-1 sm:order-2" iconSize={48} />
      </div>
    );
  }

  // ---- Ticket: coupon-style with square photo + dashed perforated divider ----
  if (offer.template === "ticket") {
    return (
      <div className="rounded-2xl bg-cream border-2 border-dashed border-berry/40 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5">
          <PhotoBlock image={offer.image} className="w-full h-32 sm:h-auto sm:w-28 rounded-xl" iconSize={28} />
          <div className="flex-1 space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase bg-berry/10 text-berry-dark px-2.5 py-1 rounded-md">
              <Tag size={12} />
              {offer.badge || "OFFER"}
            </span>
            <h2 className="text-xl sm:text-2xl font-medium text-plum">{offer.title || "Limited time offer"}</h2>
            {offer.subtitle && <p className="text-sm text-ink-muted max-w-md">{offer.subtitle}</p>}
            {endsLine && <p className="text-xs text-berry-dark">{endsLine}</p>}
          </div>
          <div className="hidden sm:flex items-center">
            <div className="h-full border-l-2 border-dashed border-berry/40" />
          </div>
          <div className="flex items-center justify-center sm:w-40 flex-shrink-0">
            <Link
              href={offer.ctaLink || "/shop"}
              className="w-full text-center bg-plum hover:bg-plum-light text-cream text-sm font-medium px-5 py-3 rounded-lg transition-colors"
            >
              {offer.ctaText || "Shop now"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---- Bar: slim inline strip with small round photo, least intrusive ----
  if (offer.template === "bar") {
    return (
      <div className="rounded-xl bg-plum text-cream pl-3 pr-4 sm:px-6 py-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          {offer.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={offer.image} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <span className="w-9 h-9 rounded-full bg-amber/15 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-amber" />
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase bg-amber text-plum px-2 py-1 rounded-md">
            {offer.badge || "OFFER"}
          </span>
          <span className="text-sm font-medium">{offer.title || "Limited time offer"}</span>
          {offer.endsAt && <InlineCountdown endsAt={offer.endsAt} />}
        </div>
        <Link
          href={offer.ctaLink || "/shop"}
          className="inline-flex items-center gap-1.5 bg-amber hover:bg-amber-dark text-plum text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex-shrink-0"
        >
          {offer.ctaText || "Shop now"}
          <ArrowRight size={13} />
        </Link>
      </div>
    );
  }

  // ---- Gradient (default/original): rich decorative dark gradient card, photo visible on all screens ----
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0f20] via-plum to-[#5c1a3a] text-cream shadow-lg ring-1 ring-amber/20">
      {/* decorative */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber/20 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-berry/30 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

      <div className="relative flex flex-col sm:grid sm:grid-cols-12 gap-0 sm:gap-6 sm:p-7 sm:items-center">
        <PhotoBlock
          image={offer.image}
          className="w-full h-40 sm:h-auto sm:col-span-5 sm:aspect-[4/3] sm:rounded-xl sm:border sm:border-white/10 order-1 sm:order-2"
          iconSize={48}
        />
        <div className="sm:col-span-7 space-y-3 p-5 sm:p-0 order-2 sm:order-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase bg-amber text-plum px-2.5 py-1 rounded-md shadow">
              <Sparkles size={12} />
              {offer.badge || "OFFER"}
            </span>
            {offer.endsAt && (
              <span className="inline-flex items-center gap-1 text-[11px] text-cream/70">
                <Clock size={12} />
                Ends {formatNepalEnd(offer.endsAt)} (Nepal time)
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold leading-tight text-cream">
            {offer.title || "Limited time offer"}
          </h2>
          {offer.subtitle && (
            <p className="text-sm text-cream/75 max-w-md leading-relaxed">{offer.subtitle}</p>
          )}

          {offer.endsAt && <Countdown endsAt={offer.endsAt} tone="dark" />}

          <div className="pt-2">
            <Link
              href={offer.ctaLink || "/shop"}
              className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-plum text-sm font-semibold px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              {offer.ctaText || "Shop now"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
