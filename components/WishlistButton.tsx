"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

/**
 * Heart-shaped save/unsave toggle. Works two ways:
 * - `initialSaved` (optional): render pre-filled without a fetch (e.g. on the wishlist page,
 *    where we already know every item here is saved).
 * - otherwise it fetches its own saved-state on mount (used on cards scattered across a grid).
 * Redirects to login if the customer isn't signed in yet.
 */
export default function WishlistButton({
  productId,
  initialSaved,
  size = 18,
  className = "",
  onRemoved
}: {
  productId: string;
  initialSaved?: boolean;
  size?: number;
  className?: string;
  onRemoved?: () => void;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(!!initialSaved);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(initialSaved !== undefined);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (checked) return;
    let cancelled = false;
    fetch("/api/wishlist?idsOnly=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.loggedIn && Array.isArray(data.productIds)) {
          setSaved(data.productIds.includes(productId));
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
    return () => {
      cancelled = true;
    };
  }, [checked, productId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (saved) {
        const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
        if (res.status === 401) {
          router.push("/account?mode=login");
          return;
        }
        if (res.ok) {
          setSaved(false);
          onRemoved?.();
        }
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId })
        });
        if (res.status === 401) {
          router.push("/account?mode=login");
          return;
        }
        if (res.ok) {
          setSaved(true);
          setPop(true);
          setTimeout(() => setPop(false), 350);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={`inline-flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-90 disabled:opacity-60 ${className}`}
    >
      <Heart
        size={size}
        className={`transition-transform ${pop ? "animate-pop" : ""} ${
          saved ? "fill-[#E11D3C] text-[#E11D3C]" : "text-ink-muted"
        }`}
        strokeWidth={saved ? 0 : 2}
      />
    </button>
  );
}
