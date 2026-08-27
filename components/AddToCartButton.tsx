"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product, VariantOption } from "@/lib/types";

export default function AddToCartButton({
  product,
  variant,
  quantity = 1,
  className,
  label = "Add to Cart"
}: {
  product: Product;
  variant: VariantOption;
  quantity?: number;
  className?: string;
  label?: string;
}) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        variantId: variant.id,
        variantName: variant.name,
        price: variant.price
      },
      quantity
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      className={`${
        className ||
        "flex-1 flex items-center justify-center gap-2 bg-berry hover:bg-berry-dark text-white text-sm font-medium rounded-lg py-3 transition-colors"
      } active:scale-95 transition-transform`}
    >
      {justAdded ? (
        <Check size={16} className="animate-pop" />
      ) : (
        <ShoppingCart size={16} className="icon-sway" />
      )}
      {justAdded ? "Added!" : label}
    </button>
  );
}
