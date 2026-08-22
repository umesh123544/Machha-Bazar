"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, ShoppingCart } from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import { useCart } from "@/lib/cart-context";

type MeCustomer = { name: string; email: string } | null;

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const [customer, setCustomer] = useState<MeCustomer>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          setCustomer({ name: data.customer.name, email: data.customer.email });
        } else {
          setCustomer(null);
        }
      })
      .catch(() => setCustomer(null));
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-cream-soft">
      <div className="max-w-6xl mx-auto flex items-center gap-2 sm:gap-4 px-3 sm:px-6 h-16">
        <Link
          href="/account"
          className="flex-shrink-0 flex items-center gap-1.5 text-plum hover:text-berry-dark"
          aria-label={customer ? "My account" : "Log in or sign up"}
        >
          <User size={22} />
          <span className="hidden sm:inline text-xs font-medium max-w-[100px] truncate">
            {customer ? customer.name || "Account" : "Login / Sign up"}
          </span>
          <span className="sm:hidden text-[10px] font-medium">
            {customer ? "Account" : "Login"}
          </span>
        </Link>

        <div className="flex-1 flex justify-center min-w-0">
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
