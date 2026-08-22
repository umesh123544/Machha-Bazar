"use client";

import Link from "next/link";
import { User, ShoppingCart } from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import { useCart } from "@/lib/cart-context";

export default function Navbar() {
  const { totalItems, openCart } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-cream-soft">
      <div className="max-w-6xl mx-auto flex items-center gap-3 sm:gap-6 px-4 sm:px-6 h-16">
        <Link
          href="/account"
          aria-label="Account"
          className="flex-shrink-0 text-plum hover:text-berry-dark"
        >
          <User size={22} />
        </Link>

        <div className="flex-1 flex justify-center">
          <GlobalSearch />
        </div>

        <button
          onClick={openCart}
          aria-label="Open cart"
          className="relative flex-shrink-0 text-plum hover:text-berry-dark"
        >
          <ShoppingCart size={22} />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-berry text-berry-text text-[10px] font-medium w-[18px] h-[18px] rounded-full flex items-center justify-center">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
