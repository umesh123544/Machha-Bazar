import Link from "next/link";
import { MessageCircle, Fish, ArrowRight } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

const TAGLINE = "Home-bred fish · Real photos · Kathmandu Valley delivery";

export default function BannerSingle({ settings }: { settings: SiteSettings }) {
  const { bannerTemplate, bannerImage, bannerBadge, bannerHeadline, bannerSubheading, whatsappNumber } = settings;

  if (bannerTemplate === "split") {
    return (
      <div className="rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 border border-cream-soft">
        <div className="bg-cream-soft px-6 sm:px-10 py-14 sm:py-20 flex flex-col justify-center order-2 sm:order-1">
          {bannerBadge && (
            <span className="inline-block text-xs font-medium text-berry-dark bg-berry/10 px-3 py-1.5 rounded-full mb-5 w-fit">
              {bannerBadge}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-medium text-plum leading-tight mb-4">{bannerHeadline}</h1>
          <p className="text-sm sm:text-base text-ink-muted max-w-md mb-2">{bannerSubheading}</p>
          <p className="text-xs sm:text-sm text-berry-dark mb-8">{TAGLINE}</p>
          <CtaButtons whatsappNumber={whatsappNumber} variant="light" />
        </div>
        <div
          className="bg-plum min-h-[220px] sm:min-h-0 bg-cover bg-center order-1 sm:order-2 relative overflow-hidden"
          style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined}
        >
          {!bannerImage && <Fish className="absolute inset-0 m-auto text-amber/10" size={180} aria-hidden />}
        </div>
      </div>
    );
  }

  if (bannerTemplate === "centered") {
    return (
      <div
        className="bg-plum rounded-2xl px-6 sm:px-12 py-16 sm:py-24 relative overflow-hidden bg-cover bg-center text-center flex flex-col items-center"
        style={bannerImage ? { backgroundImage: `linear-gradient(rgba(20,10,25,0.55), rgba(20,10,25,0.75)), url(${bannerImage})` } : undefined}
      >
        {bannerBadge && (
          <span className="inline-block text-xs font-medium text-amber bg-amber/10 px-3 py-1.5 rounded-full mb-5">
            {bannerBadge}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl font-medium text-cream leading-tight max-w-2xl mb-4">{bannerHeadline}</h1>
        <p className="text-sm sm:text-base text-cream/60 max-w-lg mb-2">{bannerSubheading}</p>
        <p className="text-xs sm:text-sm text-amber/80 mb-8">{TAGLINE}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <CtaButtons whatsappNumber={whatsappNumber} variant="dark" />
        </div>
        <div className="mt-8 flex items-center gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-amber" />
          <span className="h-1.5 w-1.5 rounded-full bg-cream/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-cream/30" />
        </div>
      </div>
    );
  }

  if (bannerTemplate === "card") {
    return (
      <div className="bg-berry/10 rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-8 items-center">
          <div className="sm:col-span-2 px-2 sm:px-4 py-4 sm:py-6">
            {bannerBadge && (
              <span className="inline-block text-xs font-medium text-berry-dark bg-white px-3 py-1.5 rounded-full mb-5 shadow-sm">
                {bannerBadge}
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-medium text-plum leading-tight mb-4">{bannerHeadline}</h1>
            <p className="text-sm sm:text-base text-ink-muted mb-6">{bannerSubheading}</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-plum hover:bg-plum-light text-cream text-sm font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Shop Available Fish
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="sm:col-span-3">
            <div
              className="rounded-2xl bg-plum aspect-[16/10] sm:aspect-[16/9] bg-cover bg-center shadow-xl relative overflow-hidden"
              style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined}
            >
              {!bannerImage && <Fish className="absolute inset-0 m-auto text-amber/10" size={140} aria-hidden />}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (bannerTemplate === "gradient") {
    return (
      <div
        className="rounded-2xl px-6 sm:px-12 py-16 sm:py-24 relative overflow-hidden text-center flex flex-col items-center"
        style={{ background: "linear-gradient(135deg, rgb(var(--color-plum)) 0%, rgb(var(--color-berry-dark)) 100%)" }}
      >
        {bannerBadge && (
          <span className="inline-block text-xs font-medium text-cream bg-white/10 px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
            {bannerBadge}
          </span>
        )}
        <h1 className="text-3xl sm:text-5xl font-medium text-cream leading-tight max-w-2xl mb-4">{bannerHeadline}</h1>
        <p className="text-sm sm:text-base text-cream/70 max-w-lg mb-8">{bannerSubheading}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/shop"
            className="bg-cream hover:bg-cream/90 text-plum text-sm font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Shop Available Fish
          </Link>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-cream/30 text-cream text-sm font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            <MessageCircle size={16} />
            Chat on WhatsApp
          </a>
        </div>
        {bannerImage && (
          <div
            className="absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-cover bg-center opacity-25 blur-[1px]"
            style={{ backgroundImage: `url(${bannerImage})` }}
          />
        )}
      </div>
    );
  }


  if (bannerTemplate === "magazine") {
    return (
      <div className="rounded-2xl overflow-hidden border border-cream-soft bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[280px] sm:min-h-[340px]">
          <div
            className="sm:col-span-7 relative bg-plum min-h-[200px] bg-cover bg-center"
            style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined}
          >
            {!bannerImage && <Fish className="absolute inset-0 m-auto text-amber/10" size={160} aria-hidden />}
            {bannerBadge && (
              <span className="absolute top-4 left-4 text-[11px] font-semibold tracking-wide uppercase text-plum bg-amber px-3 py-1 rounded-full shadow">
                {bannerBadge}
              </span>
            )}
          </div>
          <div className="sm:col-span-5 px-6 sm:px-8 py-10 sm:py-12 flex flex-col justify-center bg-cream">
            <p className="text-[11px] font-medium tracking-widest uppercase text-berry-dark mb-3">{TAGLINE}</p>
            <h1 className="text-2xl sm:text-3xl font-medium text-plum leading-snug mb-3">{bannerHeadline}</h1>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed">{bannerSubheading}</p>
            <CtaButtons whatsappNumber={whatsappNumber} variant="light" />
          </div>
        </div>
      </div>
    );
  }

  if (bannerTemplate === "overlay") {
    return (
      <div
        className="rounded-2xl relative overflow-hidden min-h-[320px] sm:min-h-[400px] bg-plum bg-cover bg-center flex items-end"
        style={bannerImage ? { backgroundImage: `url(${bannerImage})` } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        {!bannerImage && <Fish className="absolute inset-0 m-auto text-amber/10" size={200} aria-hidden />}
        <div className="relative z-10 p-6 sm:p-10 w-full max-w-2xl">
          {bannerBadge && (
            <span className="inline-block text-xs font-semibold text-plum bg-amber px-3 py-1 rounded-md mb-4 shadow-lg">
              {bannerBadge}
            </span>
          )}
          <h1 className="text-3xl sm:text-5xl font-medium text-white leading-tight mb-3 drop-shadow-sm">{bannerHeadline}</h1>
          <p className="text-sm sm:text-base text-white/80 mb-6 max-w-lg">{bannerSubheading}</p>
          <div className="flex flex-wrap gap-3">
            <CtaButtons whatsappNumber={whatsappNumber} variant="dark" />
          </div>
        </div>
      </div>
    );
  }

  if (bannerTemplate === "wave") {
    return (
      <div className="rounded-2xl overflow-hidden relative bg-plum">
        <div className="relative z-10 px-6 sm:px-12 py-14 sm:py-20 max-w-xl">
          {bannerBadge && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber border border-amber/40 px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
              {bannerBadge}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-medium text-cream leading-tight mb-4">{bannerHeadline}</h1>
          <p className="text-sm sm:text-base text-cream/65 mb-8">{bannerSubheading}</p>
          <div className="flex flex-wrap gap-3">
            <CtaButtons whatsappNumber={whatsappNumber} variant="dark" />
          </div>
        </div>
        <div
          className="absolute right-0 top-0 bottom-0 w-1/2 hidden sm:block bg-cover bg-center opacity-40"
          style={bannerImage ? { backgroundImage: `url(${bannerImage})`, maskImage: "linear-gradient(to left, black 40%, transparent)" } : undefined}
        />
        <svg className="absolute bottom-0 left-0 right-0 text-cream/10" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" />
        </svg>
        {!bannerImage && <Fish className="absolute right-8 bottom-8 text-amber/10" size={140} aria-hidden />}
      </div>
    );
  }

  // classic (default)
  return (
    <div
      className="bg-plum rounded-2xl px-6 sm:px-12 py-14 sm:py-20 relative overflow-hidden bg-cover bg-center"
      style={bannerImage ? { backgroundImage: `linear-gradient(rgba(45,20,45,0.72), rgba(45,20,45,0.72)), url(${bannerImage})` } : undefined}
    >
      {bannerBadge && (
        <span className="inline-block text-xs font-medium text-amber bg-amber/10 px-3 py-1.5 rounded-full mb-5">
          {bannerBadge}
        </span>
      )}
      <h1 className="text-3xl sm:text-5xl font-medium text-cream leading-tight max-w-xl mb-4">{bannerHeadline}</h1>
      <p className="text-sm sm:text-base text-cream/60 max-w-md mb-2">{bannerSubheading}</p>
      <p className="text-xs sm:text-sm text-amber/80 mb-8">{TAGLINE}</p>
      <div className="flex flex-wrap gap-3">
        <CtaButtons whatsappNumber={whatsappNumber} variant="dark" />
      </div>
      {!bannerImage && <Fish className="absolute -right-4 -bottom-6 text-amber/5" size={260} aria-hidden />}
    </div>
  );
}

function CtaButtons({ whatsappNumber, variant }: { whatsappNumber: string; variant: "dark" | "light" }) {
  return (
    <>
      <Link
        href="/shop"
        className="bg-berry hover:bg-berry-dark text-berry-text text-sm font-medium px-6 py-3 rounded-lg transition-colors"
      >
        Shop Available Fish
      </Link>
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className={
          variant === "dark"
            ? "flex items-center gap-2 border border-cream/25 text-cream text-sm font-medium px-6 py-3 rounded-lg hover:bg-cream/5 transition-colors"
            : "flex items-center gap-2 border border-plum/20 text-plum text-sm font-medium px-6 py-3 rounded-lg hover:bg-plum/5 transition-colors"
        }
      >
        <MessageCircle size={16} />
        Chat on WhatsApp
      </a>
    </>
  );
}
