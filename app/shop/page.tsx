import type { Metadata } from "next";
import { getActiveProducts, getCategories } from "@/lib/data";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Aquarium Fish",
  description: "Browse currently available aquarium fish from Maccha Bazar, home-bred and raised in Kathmandu Valley."
};

export default async function ShopPage() {
  const products = await getActiveProducts();
  const categories = await getCategories();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-medium text-plum">Shop available fish</h1>
        <p className="text-sm text-ink-muted mt-1">Currently available: {categories.find(c => c.slug === "guppy")?.name}. More categories coming soon.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-6 mb-2">
        <span className="flex-shrink-0 text-xs font-medium bg-plum text-cream px-4 py-2 rounded-full">All</span>
        {categories.map((cat) => (
          <span
            key={cat.id}
            className={`flex-shrink-0 text-xs font-medium px-4 py-2 rounded-full ${
              cat.active ? "bg-cream-soft text-ink" : "bg-cream-soft text-ink-muted/60"
            }`}
          >
            {cat.name}{cat.comingSoon ? " (soon)" : ""}
          </span>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink-muted mb-4">No fish available right now.</p>
          <a href="/contact" className="text-sm font-medium text-berry-dark">Message Us for Availability</a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
