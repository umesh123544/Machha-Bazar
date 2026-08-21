import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts, getCategories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Aquarium Fish",
  description: "Browse currently available aquarium fish from Maccha Bazar, home-bred and raised in Kathmandu Valley."
};

export default async function ShopPage({
  searchParams
}: {
  searchParams: { category?: string };
}) {
  const products = await getActiveProducts();
  const categories = await getCategories();
  const activeSlug = searchParams?.category || "";

  const activeCategory = categories.find((c) => c.slug === activeSlug);
  const filteredProducts = activeSlug
    ? products.filter((p) => p.categorySlug === activeSlug)
    : products;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium text-plum">
          {activeCategory ? activeCategory.name : "Shop available fish"}
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          {activeCategory
            ? activeCategory.description || `Browsing ${activeCategory.name}.`
            : `Currently available: ${categories.find((c) => c.slug === "guppy")?.name}. More categories coming soon.`}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-6 mb-2">
        <Link
          href="/shop"
          className={`flex-shrink-0 text-xs font-medium px-4 py-2 rounded-full ${
            !activeSlug ? "bg-plum text-cream" : "bg-cream-soft text-ink"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => {
          const isActive = cat.slug === activeSlug;
          if (!cat.active || cat.comingSoon) {
            return (
              <span
                key={cat.id}
                className="flex-shrink-0 text-xs font-medium px-4 py-2 rounded-full bg-cream-soft text-ink-muted/60"
              >
                {cat.name} (soon)
              </span>
            );
          }
          return (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className={`flex-shrink-0 text-xs font-medium px-4 py-2 rounded-full ${
                isActive ? "bg-plum text-cream" : "bg-cream-soft text-ink"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink-muted mb-4">
            {activeCategory ? `No fish available in ${activeCategory.name} right now.` : "No fish available right now."}
          </p>
          <a href="/contact" className="text-sm font-medium text-berry-dark">Message Us for Availability</a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
