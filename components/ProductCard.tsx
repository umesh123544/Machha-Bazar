import Link from "next/link";
import { Fish } from "lucide-react";
import type { Product } from "@/lib/types";
import { hasDiscount, discountPercent } from "@/lib/pricing";
import StockBadge from "./StockBadge";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: { product: Product }) {
  const lowestVariant = product.variants.slice().sort((a, b) => a.price - b.price)[0];
  const hasPhoto = product.image && !product.image.includes("fish-placeholder");
  const soldOut = product.stockStatus === "sold_out" || !lowestVariant;
  const onSale = hasDiscount(lowestVariant);

  return (
    <div className="bg-white rounded-2xl border border-cream-soft overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/product/${product.slug}`}>
        <div className="h-40 bg-plum flex items-center justify-center relative overflow-hidden">
          {onSale && (
            <span className="absolute top-2 left-2 z-10 bg-berry text-berry-text text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {discountPercent(lowestVariant)}% OFF
            </span>
          )}
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Fish size={48} className="text-amber group-hover:scale-105 transition-transform" />
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="text-xs text-berry-dark font-medium mb-1">{product.category}</div>
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-plum mb-1 hover:text-berry-dark">{product.name}</h3>
        </Link>
        <p className="text-xs text-ink-muted mb-2 line-clamp-2">{product.shortDescription}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-baseline gap-1.5">
            <span className="text-sm font-medium text-plum">
              {lowestVariant ? `Rs. ${lowestVariant.price}` : ""}
            </span>
            {onSale && (
              <span className="text-xs text-ink-muted line-through">Rs. {lowestVariant!.compareAtPrice}</span>
            )}
          </span>
          <StockBadge status={product.stockStatus} />
        </div>
        {soldOut ? (
          <Link
            href={`/product/${product.slug}`}
            className="block text-center text-sm font-medium bg-cream-soft text-ink-muted rounded-lg py-2 transition-colors"
          >
            View Details
          </Link>
        ) : (
          <div className="flex gap-2">
            <Link
              href={`/product/${product.slug}`}
              className="flex-1 text-center text-sm font-medium border border-cream-soft text-plum rounded-lg py-2 hover:border-berry transition-colors"
            >
              View
            </Link>
            <AddToCartButton
              product={product}
              variant={lowestVariant}
              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium bg-berry hover:bg-berry-dark text-berry-text rounded-lg py-2 transition-colors"
              label="Add"
            />
          </div>
        )}
      </div>
    </div>
  );
}
