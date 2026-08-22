"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import CartDrawer from "./CartDrawer";
import { CartProvider } from "@/lib/cart-context";
import type { SiteSettings } from "@/lib/types";

export default function SiteChrome({
  settings,
  children
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Navbar />
      <main className="min-h-screen pb-20">{children}</main>
      <BottomNav whatsappNumber={settings.whatsappNumber} />
      <CartDrawer whatsappNumber={settings.whatsappNumber} businessName={settings.businessName} />
    </CartProvider>
  );
}
