"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBar from "./AnnouncementBar";
import WhatsAppFab from "./WhatsAppFab";
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
    <>
      <AnnouncementBar />
      <Navbar whatsappNumber={settings.whatsappNumber} />
      <main className="min-h-screen">{children}</main>
      <Footer settings={settings} />
      <WhatsAppFab whatsappNumber={settings.whatsappNumber} />
    </>
  );
}
