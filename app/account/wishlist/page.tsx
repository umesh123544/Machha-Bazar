"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        setLoggedIn(data.loggedIn !== false);
        setProducts(data.products || []);
      })
      .catch(() => setProducts([]));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/account" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-plum mb-4">
        <ArrowLeft size={16} /> Back to account
      </Link>
      <h1 className="text-2xl font-medium text-plum mb-1">My Wishlist</h1>
      <p className="text-sm text-ink-muted mb-6">Fish you've saved for later.</p>

      {products === null ? (
        <p className="text-sm text-ink-muted">Loading...</p>
      ) : !loggedIn ? (
        <div className="bg-white border border-cream-soft rounded-xl p-8 text-center">
          <p className="text-sm text-ink-muted mb-4">Log in to see your saved fish.</p>
          <Link
            href="/account"
            className="inline-block text-sm font-medium bg-berry hover:bg-berry-dark text-white rounded-lg px-5 py-2.5"
          >
            Log in
          </Link>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-cream-soft rounded-xl p-8 text-center">
          <Heart size={32} className="mx-auto text-ink-muted mb-3" />
          <p className="text-sm text-ink-muted mb-4">
            No saved fish yet. Tap the heart icon on any product to save it here.
          </p>
          <Link
            href="/shop"
            className="inline-block text-sm font-medium bg-berry hover:bg-berry-dark text-white rounded-lg px-5 py-2.5"
          >
            Browse fish
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              wishlisted
              onWishlistRemoved={() => setProducts((prev) => (prev ? prev.filter((x) => x.id !== p.id) : prev))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
