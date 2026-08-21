import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import InstallPWA from "@/components/InstallPWA";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aquarealmfish.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AquaRealm Fish | Healthy Aquarium Fish in Kathmandu Valley",
    template: "%s | AquaRealm Fish"
  },
  description:
    "Healthy, home-bred aquarium fish with delivery inside Kathmandu Valley. Browse available Guppy fish and order directly on WhatsApp.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/favicon.svg",
    apple: "/icons/apple-touch-icon.png"
  },
  openGraph: {
    title: "AquaRealm Fish",
    description: "Healthy Fish. Beautiful Aquariums. Kathmandu Valley delivery.",
    url: siteUrl,
    siteName: "AquaRealm Fish",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#2B1B33",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en">
      <body className="font-sans text-plum antialiased">
        <SiteChrome settings={settings}>{children}</SiteChrome>
        <InstallPWA />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}
