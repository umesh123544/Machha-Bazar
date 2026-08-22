"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, Fish } from "lucide-react";

type SearchProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  price: number | null;
  stockStatus: string;
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<SearchProduct[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function ensureLoaded() {
    if (allProducts) return;
    try {
      const res = await fetch("/api/search");
      const data = await res.json();
      setAllProducts(data);
    } catch {
      setAllProducts([]);
    }
  }

  const results =
    query.trim().length > 0 && allProducts
      ? allProducts
          .filter(
            (p) =>
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              p.category.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 8)
      : [];

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 bg-cream-soft rounded-lg px-3 py-2">
        <Search size={16} className="text-ink-muted flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setExpanded(true);
            ensureLoaded();
          }}
          placeholder="Search fish..."
          className="bg-transparent flex-1 min-w-0 text-sm text-ink outline-none placeholder:text-ink-muted"
        />
        {query && (
          <button
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="text-ink-muted flex-shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {expanded && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-cream-soft rounded-xl shadow-lg max-h-80 overflow-y-auto z-50">
          {results.length === 0 ? (
            <p className="text-sm text-ink-muted px-4 py-4">No fish found for &quot;{query}&quot;.</p>
          ) : (
            results.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                onClick={() => {
                  setExpanded(false);
                  setQuery("");
                }}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-cream-soft transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-plum flex items-center justify-center overflow-hidden flex-shrink-0">
                  {p.image && !p.image.includes("fish-placeholder") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Fish size={16} className="text-amber" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink truncate">{p.name}</div>
                  <div className="text-xs text-ink-muted">{p.category}</div>
                </div>
                {p.price !== null && (
                  <div className="text-xs font-medium text-plum flex-shrink-0">Rs. {p.price}</div>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
