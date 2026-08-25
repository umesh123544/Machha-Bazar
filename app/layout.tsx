import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { getSiteSettings } from "@/lib/data";
import { getFontOption } from "@/lib/fonts";
import { rgbTriplet, adjustLightness, darkTextShade } from "@/lib/color";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://machha-bazar.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings.businessName || "Maccha Bazar";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${name} | Healthy Aquarium Fish in Kathmandu Valley`,
      template: `%s | ${name}`
    },
    description:
      "Healthy, home-bred aquarium fish with delivery inside Kathmandu Valley. Browse available Guppy fish and order directly on WhatsApp.",
    manifest: "/manifest.json",
    icons: {
      icon: "/icons/favicon.svg",
      apple: "/icons/apple-touch-icon.png"
    },
    openGraph: {
      title: name,
      description: "Healthy Fish. Beautiful Aquariums. Kathmandu Valley delivery.",
      url: siteUrl,
      siteName: name,
      type: "website",
      images: [
        {
          url: "/icons/icon-512.png",
          width: 512,
          height: 512,
          alt: `${name} logo`
        }
      ]
    },
    twitter: {
      card: "summary",
      title: name,
      description: "Healthy Fish. Beautiful Aquariums. Kathmandu Valley delivery.",
      images: ["/icons/icon-512.png"]
    }
  };
}

export const viewport: Viewport = {
  themeColor: "#2B1B33",
  width: "device-width",
  initialScale: 1
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const font = getFontOption(settings.siteFont);

  const themeVars = [
    `--color-plum: ${rgbTriplet(settings.primaryColor)};`,
    `--color-plum-light: ${adjustLightness(settings.primaryColor, 0.1)};`,
    `--color-berry: ${rgbTriplet(settings.accentColor)};`,
    `--color-berry-dark: ${adjustLightness(settings.accentColor, -0.12)};`,
    `--color-berry-text: ${darkTextShade(settings.accentColor)};`,
    `--color-amber: ${rgbTriplet(settings.highlightColor)};`,
    `--color-amber-dark: ${adjustLightness(settings.highlightColor, -0.22)};`,
    `--font-sans: ${font.stack};`
  ].join(" ");

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href={`https://fonts.googleapis.com/css2?family=${font.googleParam}&display=swap`}
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `:root { ${themeVars} }` }} />
      </head>
      <body className="font-sans text-plum antialiased">
        <SiteChrome settings={settings}>{children}</SiteChrome>
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
