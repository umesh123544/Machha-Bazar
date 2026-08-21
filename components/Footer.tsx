import Link from "next/link";
import { MessageCircle, Facebook, Instagram } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export default function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-plum text-cream mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <div className="text-lg font-semibold">{settings.businessName}</div>
          <p className="text-sm text-cream/60 mt-2">{settings.tagline}</p>
          <div className="flex items-center gap-4 mt-4">
            <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-cream/70 hover:text-amber">
              <MessageCircle size={18} />
            </a>
            <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-cream/70 hover:text-amber">
              <Facebook size={18} />
            </a>
            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-cream/70 hover:text-amber">
              <Instagram size={18} />
            </a>
          </div>
        </div>

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
        © 2026 {settings.businessName}. All rights reserved.
      </div>
    </footer>
  );
}
