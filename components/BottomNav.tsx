"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, BoxIcon, BookTextIcon, PhoneCallIcon } from "lucide-animated";
import AutoAnimIcon from "./AutoAnimIcon";
import WhatsAppIcon from "./WhatsAppIcon";

export default function BottomNav({ whatsappNumber }: { whatsappNumber: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Home", icon: HomeIcon, delay: 0 },
    { href: "/shop", label: "Shop", icon: BoxIcon, delay: 400 },
    { href: "/care-guide", label: "Care", icon: BookTextIcon, delay: 800 },
    { href: "/contact", label: "Contact", icon: PhoneCallIcon, delay: 1200 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur border-t border-cream-soft flex items-stretch pb-[env(safe-area-inset-bottom)]">
      <div className="flex w-full max-w-2xl mx-auto">
        {tabs.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium ${
                active ? "text-berry-dark" : "text-ink-muted"
              }`}
            >
              <AutoAnimIcon icon={tab.icon} size={20} intervalMs={3600} delayMs={tab.delay} className="text-current" />
              {tab.label}
            </Link>
          );
        })}
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium text-[#1E7A6E]"
        >
          <WhatsAppIcon size={20} className="icon-ring" />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
