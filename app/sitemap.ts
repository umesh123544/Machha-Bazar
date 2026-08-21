import type { MetadataRoute } from "next";
import { getActiveProducts } from "@/lib/data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://macchabazar.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/shop", "/about", "/care-guide", "/contact", "/delivery", "/privacy-policy", "/terms"].map((route) => ({
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
