"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, BookOpen, MessageCircle, Phone } from "lucide-react";

export default function BottomNav({ whatsappNumber }: { whatsappNumber: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/care-guide", label: "Care", icon: BookOpen },
    { href: "/contact", label: "Contact", icon: Phone }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur border-t border-cream-soft flex items-stretch pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium ${
              active ? "text-berry-dark" : "text-ink-muted"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.4 : 2} />
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
        <MessageCircle size={20} />
        WhatsApp
      </a>
    </nav>
  );
}
