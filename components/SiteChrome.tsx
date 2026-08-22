"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AnnouncementBar from "./AnnouncementBar";
import BottomNav from "./BottomNav";
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
      <Navbar whatsappNumber={settings.whatsappNumber} businessName={settings.businessName} logoUrl={settings.logoUrl} />
      <main className="min-h-screen pb-20 md:pb-0">{children}</main>
      <Footer settings={settings} />
      <BottomNav whatsappNumber={settings.whatsappNumber} />
    </>
  );
}
