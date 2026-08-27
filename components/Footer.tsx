import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import type { SiteSettings } from "@/lib/types";

// TikTok icon (not in lucide-react, so inline SVG)
function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

// WhatsApp share link — opens a pre-filled message with the site link
function makeWaShareLink(number: string, siteUrl: string, businessName: string) {
  const msg = encodeURIComponent(
    `Check out ${businessName}! 🐟\n${siteUrl}`
  );
  return `https://wa.me/${number}?text=${msg}`;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://machha-bazar-beta.vercel.app";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const socialLinks = [
    {
      href: `https://wa.me/${settings.whatsappNumber}`,
      label: "WhatsApp",
      icon: <WhatsAppIcon size={18} />,
      show: !!settings.whatsappNumber,
    },
    {
      href: settings.facebookUrl,
      label: "Facebook",
      icon: <Facebook size={18} />,
      show: !!settings.facebookUrl,
    },
    {
      href: settings.instagramUrl,
      label: "Instagram",
      icon: <Instagram size={18} />,
      show: !!settings.instagramUrl,
    },
    {
      href: settings.tiktokUrl,
      label: "TikTok",
      icon: <TikTokIcon size={18} />,
      show: !!settings.tiktokUrl,
    },
    {
      href: settings.youtubeUrl,
      label: "YouTube",
      icon: <Youtube size={18} />,
      show: !!settings.youtubeUrl,
    },
  ];

  return (
    <footer className="bg-plum text-cream mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        {/* Brand + social */}
        <div>
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt={settings.businessName}
              className={`${settings.logoSize === "small" ? "h-8" : settings.logoSize === "large" ? "h-16" : "h-11"} w-auto object-contain mb-1`}
            />
          ) : (
            <div className="flex items-center gap-2 mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-192.png" alt="logo" className="h-8 w-8 rounded-lg object-contain" />
              <span className="text-lg font-semibold">{settings.businessName}</span>
            </div>
          )}
          <p className="text-sm text-cream/60 mt-2">{settings.tagline}</p>

          {/* Social icons */}
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            {socialLinks.filter((l) => l.show).map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                className="text-cream/70 hover:text-amber hover:scale-110 transition-all"
              >
                <span className={`inline-block ${["", "", "", "", ""][i % 5]}`}>
                  {l.icon}
                </span>
              </a>
            ))}
          </div>

          {/* WhatsApp share button */}
          {settings.whatsappNumber && (
            <a
              href={makeWaShareLink(settings.whatsappNumber, SITE_URL, settings.businessName)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-192.png" alt="" className="h-4 w-4 rounded object-contain" />
              Share on WhatsApp
            </a>
          )}
        </div>

        {/* Explore */}
        <div>
          <div className="text-sm font-medium mb-3">Explore</div>
          <div className="flex flex-col gap-2 text-sm text-cream/60">
            <Link href="/" className="hover:text-amber">Home</Link>
            <Link href="/shop" className="hover:text-amber">Shop</Link>
            <Link href="/about" className="hover:text-amber">About</Link>
            <Link href="/care-guide" className="hover:text-amber">Care Guide</Link>
            <Link href="/delivery" className="hover:text-amber">Delivery</Link>
            <Link href="/contact" className="hover:text-amber">Contact</Link>
          </div>
        </div>

        {/* Legal + contact */}
        <div>
          <div className="text-sm font-medium mb-3">Legal</div>
          <div className="flex flex-col gap-2 text-sm text-cream/60">
            <Link href="/privacy-policy" className="hover:text-amber">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-amber">Terms & Conditions</Link>
          </div>
          <div className="text-sm font-medium mt-6 mb-2">Contact</div>
          <div className="text-sm text-cream/60">{settings.phone}</div>
          <div className="text-sm text-cream/60">{settings.address}</div>
        </div>
      </div>

      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/40">
        © {new Date().getFullYear()} {settings.businessName}. All rights reserved.
      </div>
    </footer>
  );
}
