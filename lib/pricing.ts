import type { VariantOption } from "./types";

/** True when a variant has a valid "was" price higher than its current price. */
export function hasDiscount(variant?: VariantOption | null): boolean {
  return !!variant && !!variant.compareAtPrice && variant.compareAtPrice > variant.price;
}

/** Rounded percentage off, e.g. 25 for 25% off. Returns 0 when there's no discount. */
export function discountPercent(variant?: VariantOption | null): number {
  if (!hasDiscount(variant)) return 0;
  const { price, compareAtPrice } = variant as VariantOption;
  return Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100);
}
