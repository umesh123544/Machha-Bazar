import { notFound } from "next/navigation";
import Link from "next/link";
import { Fish, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { getProductBySlug, getSiteSettings } from "@/lib/data";
import ProductOrderPanel from "@/components/ProductOrderPanel";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Fish Not Found" };
  const settings = await getSiteSettings();
  const name = settings.businessName || "Maccha Bazar";
  return {
    title: `${product.name} | ${name}`,
    description: `${product.shortDescription} Home-bred and available with Kathmandu Valley delivery from ${name}.`
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  const settings = await getSiteSettings();

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-medium text-plum mb-2">Fish Not Found</h1>
        <p className="text-sm text-ink-muted mb-6">We couldn&apos;t find the fish you&apos;re looking for.</p>
        <Link href="/shop" className="text-sm font-medium text-berry-dark">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-plum mb-6">
        <ArrowLeft size={14} />
        Back to shop
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="h-72 sm:h-96 bg-plum rounded-2xl flex items-center justify-center relative overflow-hidden">
          {product.image && !product.image.includes("fish-placeholder") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Fish size={90} className="text-amber" />
          )}
        </div>
        <ProductOrderPanel product={product} whatsappNumber={settings.whatsappNumber} businessName={settings.businessName} />
      </div>

      <div className="mt-14 max-w-3xl">
        <h2 className="text-lg font-medium text-plum mb-3">About this fish</h2>
        <p className="text-sm text-ink-muted leading-relaxed">{product.description}</p>
      </div>
    </div>
  );
}
