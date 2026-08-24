"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, ShoppingCart } from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import { useCart } from "@/lib/cart-context";

type MeCustomer = { name: string; email: string; avatarUrl?: string } | null;

const DEFAULT_AVATAR = "/avatars/default-1.svg";

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const [customer, setCustomer] = useState<MeCustomer>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          setCustomer({
            name: data.customer.name,
            email: data.customer.email,
            avatarUrl: data.customer.avatarUrl || ""
          });
        } else {
          setCustomer(null);
        }
      })
      .catch(() => setCustomer(null));

    // refresh avatar when returning from account page
    const onFocus = () => {
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((data) => {
          if (data.customer) {
            setCustomer({
              name: data.customer.name,
              email: data.customer.email,
              avatarUrl: data.customer.avatarUrl || ""
            });
          } else {
            setCustomer(null);
          }
        })
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-cream-soft">
      <div className="max-w-6xl mx-auto flex items-center gap-2 sm:gap-4 px-3 sm:px-6 h-16">
        <Link
          href="/account"
          className="flex-shrink-0 flex items-center text-plum hover:opacity-80"
          aria-label={customer ? "My account" : "Log in or sign up"}
        >
          {customer ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={customer.avatarUrl || DEFAULT_AVATAR}
              alt=""
              className="w-9 h-9 rounded-full object-cover border-2 border-berry/40 bg-cream-soft"
            />
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="w-9 h-9 rounded-full border border-cream-soft bg-white flex items-center justify-center">
                <User size={18} />
              </span>
              <span className="hidden sm:inline text-xs font-medium">Login</span>
            </span>
          )}
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
