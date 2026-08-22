"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Clock } from "lucide-react";
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

export default function OfferBanner({ offer }: { offer: OfferSettings }) {
  const [parts, setParts] = useState<Parts | null>(() => getParts(offer.endsAt));

  useEffect(() => {
    setParts(getParts(offer.endsAt));
    const id = setInterval(() => setParts(getParts(offer.endsAt)), 1000);
    return () => clearInterval(id);
  }, [offer.endsAt]);

  const active = useMemo(() => {
    if (!offer.enabled) return false;
    if (!offer.endsAt) return true; // no end = show until manually hidden
    return parts !== null;
  }, [offer.enabled, offer.endsAt, parts]);

  if (!active) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0f20] via-plum to-[#5c1a3a] text-cream shadow-lg ring-1 ring-amber/20">
      {/* decorative */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber/20 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-berry/30 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />

      <div className="relative grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 p-5 sm:p-7 items-center">
        <div className="sm:col-span-7 space-y-3">
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

          {parts && (
            <div className="flex flex-wrap gap-2 pt-1">
              {(
                [
                  { label: "Days", value: parts.days },
                  { label: "Hrs", value: parts.hours },
                  { label: "Min", value: parts.minutes },
                  { label: "Sec", value: parts.seconds }
                ] as const
              ).map((box) => (
                <div
                  key={box.label}
                  className="min-w-[58px] rounded-xl bg-black/30 border border-white/10 backdrop-blur px-2.5 py-2 text-center"
                >
                  <div className="text-xl sm:text-2xl font-semibold tabular-nums text-amber leading-none">
                    {pad(box.value)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wide text-cream/55 mt-1">{box.label}</div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <Link
              href={offer.ctaLink || "/shop"}
              className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-plum text-sm font-semibold px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              {offer.ctaText || "Shop now"}
            </Link>
          </div>
        </div>

        <div className="sm:col-span-5 hidden sm:block">
          <div
            className="aspect-[4/3] rounded-xl bg-cover bg-center border border-white/10 shadow-inner overflow-hidden relative"
            style={
              offer.image
                ? { backgroundImage: `url(${offer.image})` }
                : { background: "linear-gradient(135deg, rgba(240,184,76,0.25), rgba(214,94,140,0.2))" }
            }
          >
            {!offer.image && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-amber/40" size={48} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
