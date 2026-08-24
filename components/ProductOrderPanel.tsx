"use client";

import { useState } from "react";
import { HelpCircle, Minus, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { buildInquiryMessage, whatsappLink } from "@/lib/whatsapp";
import { hasDiscount, discountPercent } from "@/lib/pricing";
import AddToCartButton from "./AddToCartButton";
import StockBadge from "./StockBadge";

export default function ProductOrderPanel({
  product,
  whatsappNumber,
  businessName
}: {
  product: Product;
  whatsappNumber: string;
  businessName: string;
}) {
  const [variantId, setVariantId] = useState(product.variants[0]?.id);
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants.find((v) => v.id === variantId) || product.variants[0];
  const soldOut = product.stockStatus === "sold_out" || !variant;

  const inquiryUrl = whatsappLink(whatsappNumber, buildInquiryMessage(businessName, product.name));

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-medium text-berry-dark">{product.category}</span>
        <StockBadge status={product.stockStatus} />
      </div>
      <h1 className="text-2xl sm:text-3xl font-medium text-plum mb-2">{product.name}</h1>
      <p className="text-sm text-ink-muted mb-6">{product.shortDescription}</p>

      {variant && (
        <div className="flex items-center gap-3 mb-6">
          <div className="text-2xl font-medium text-plum">
            Rs. {variant.price} <span className="text-sm text-ink-muted font-normal">/ {variant.name}</span>
          </div>
          {hasDiscount(variant) && (
            <>
              <span className="text-base text-ink-muted line-through">Rs. {variant.compareAtPrice}</span>
              <span className="bg-berry text-berry-text text-xs font-semibold px-2 py-0.5 rounded-full">
                {discountPercent(variant)}% OFF
              </span>
            </>
          )}
        </div>
      )}

      {product.variants.length > 1 && (
        <div className="mb-6">
          <div className="text-xs font-medium text-ink-muted mb-2">Variant</div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                  v.id === variantId
                    ? "bg-plum text-cream border-plum"
                    : "border-cream-soft text-ink hover:border-berry"
                }`}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="text-xs font-medium text-ink-muted mb-2">Quantity</div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center border border-cream-soft rounded-lg text-plum"
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-9 h-9 flex items-center justify-center border border-cream-soft rounded-lg text-plum"
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="text-xs text-ink-muted mb-6">Size: {product.size}</div>

      <div className="flex flex-col sm:flex-row gap-3">
        {soldOut ? (
          <span className="flex-1 text-center text-sm font-medium bg-cream-soft text-ink-muted rounded-lg py-3">
            Sold Out
          </span>
        ) : (
          <AddToCartButton product={product} variant={variant} quantity={quantity} label="Add to Cart" />
        )}
        <a
          href={inquiryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 border border-cream-soft text-plum text-sm font-medium rounded-lg py-3 hover:border-berry transition-colors"
        >
          <HelpCircle size={16} />
          Ask About This Fish
        </a>
      </div>
    </div>
  );
}
