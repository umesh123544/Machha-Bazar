"use client";

import { X, Minus, Plus, Trash2, Fish } from "lucide-react";
import WhatsAppIcon from "./WhatsAppIcon";
import { useCart } from "@/lib/cart-context";
import { buildCartOrderMessage, whatsappLink } from "@/lib/whatsapp";

export default function CartDrawer({
  whatsappNumber,
  businessName
}: {
  whatsappNumber: string;
  businessName: string;
}) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  if (!isOpen) return null;

  const checkoutUrl = whatsappLink(whatsappNumber, buildCartOrderMessage(businessName, items));

  async function handleCheckout() {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            slug: i.slug,
            name: i.name,
            variantName: i.variantName,
            price: i.price,
            quantity: i.quantity
          }))
        })
      });
    } catch {
      // still open WhatsApp even if logging fails
    }
    setTimeout(clearCart, 500);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
      <div className="relative w-full max-w-sm bg-cream h-full flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-soft">
          <h2 className="text-base font-medium text-plum">Your Cart</h2>
          <button aria-label="Close cart" onClick={closeCart} className="text-ink-muted">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-sm text-ink-muted text-center mt-10">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-plum flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image && !item.image.includes("fish-placeholder") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Fish size={20} className="text-amber" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-plum truncate">{item.name}</div>
                    <div className="text-xs text-ink-muted mb-1">{item.variantName}</div>
                    <div className="text-xs font-medium text-plum">Rs. {item.price}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center border border-cream-soft rounded text-plum"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center border border-cream-soft rounded text-plum"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="ml-auto text-ink-muted hover:text-[#A32D2D]"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-cream-soft px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm font-medium text-plum">
              <span>Total</span>
              <span>Rs. {totalPrice}</span>
            </div>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCheckout}
              className="flex items-center justify-center gap-2 bg-berry hover:bg-berry-dark text-white text-sm font-medium rounded-lg py-3 w-full transition-colors"
            >
              <WhatsAppIcon size={16} className="icon-ring" />
              Checkout via WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
