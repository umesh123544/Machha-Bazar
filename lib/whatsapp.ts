import type { Product, VariantOption } from "./types";
import type { CartItem } from "./cart-context";

export function buildOrderMessage(
  businessName: string,
  product: Product,
  variant: VariantOption,
  quantity: number
) {
  return `Hello ${businessName}\nI would like to order:\n\nFish: ${product.name}\nVariant: ${variant.name}\nQuantity: ${quantity}\nPrice: Rs. ${variant.price} / ${variant.name}\n\nMy Name:\nPhone:\nLocation:\nDelivery Address:\n\nPlease confirm availability and delivery charges.`;
}

export function buildInquiryMessage(businessName: string, productName: string) {
  return `Hello ${businessName}\nI am interested in ${productName}. Is it currently available?`;
}

export function buildCartOrderMessage(businessName: string, items: CartItem[]) {
  const lines = items.map(
    (i, idx) =>
      `${idx + 1}. ${i.name} (${i.variantName}) x${i.quantity} - Rs. ${i.price * i.quantity}`
  );
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return `Hello ${businessName}\nI would like to order:\n\n${lines.join("\n")}\n\nTotal: Rs. ${total}\n\nMy Name:\nPhone:\nLocation:\nDelivery Address:\n\nPlease confirm availability and delivery charges.`;
}

export function buildDeliveryCheckMessage() {
  return `Hello, I would like to check whether delivery is available at my location.`;
}

export function whatsappLink(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
