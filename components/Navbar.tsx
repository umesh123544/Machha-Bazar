"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Search, MessageCircle } from "lucide-react";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/care-guide", label: "Care Guide" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export default function Navbar({ whatsappNumber, businessName }: { whatsappNumber: string; businessName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-cream-soft">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
        <Link href="/" className="text-lg font-semibold text-plum tracking-tight">
          {businessName}
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink hover:text-berry-dark transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button aria-label="Search" className="text-plum hover:text-berry-dark">
            <Search size={20} />
          </button>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-berry hover:bg-berry-dark text-berry-text text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <MessageCircle size={16} />
            Message Us
          </a>
        </div>

        <button
          className="md:hidden text-plum"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-cream-soft bg-cream px-4 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-berry text-berry-text text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            <MessageCircle size={16} />
            Message Us on WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
