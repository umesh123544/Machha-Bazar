import Link from "next/link";
import { Fish } from "lucide-react";
import type { Product } from "@/lib/types";
import StockBadge from "./StockBadge";

export default function ProductCard({ product }: { product: Product }) {
  const lowestPrice = Math.min(...product.variants.map((v) => v.price));
  const hasPhoto = product.image && !product.image.includes("fish-placeholder");

  return (
    <div className="bg-white rounded-2xl border border-cream-soft overflow-hidden hover:shadow-md transition-shadow group">
      <Link href={`/product/${product.slug}`}>
        <div className="h-40 bg-plum flex items-center justify-center relative overflow-hidden">
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
          <span className="text-sm font-medium text-plum">From Rs. {lowestPrice}</span>
          <StockBadge status={product.stockStatus} />
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="block text-center text-sm font-medium bg-berry hover:bg-berry-dark text-berry-text rounded-lg py-2 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
