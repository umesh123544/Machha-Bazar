import type { MetadataRoute } from "next";
import { getActiveProducts, getSiteSettings } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://macchabazar.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const routes = ["", "/shop", "/care-guide", "/contact", "/privacy-policy", "/terms"];
  if (settings.showAboutPage !== false) routes.push("/about");
  if (settings.showDeliveryPage !== false) routes.push("/delivery");

  const staticRoutes = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date()
  }));

  const activeProducts = await getActiveProducts();
  const productRoutes = activeProducts.map((p) => ({
    url: `${siteUrl}/product/${p.slug}`,
    lastModified: new Date(p.updatedAt)
  }));

  return [...staticRoutes, ...productRoutes];
}
