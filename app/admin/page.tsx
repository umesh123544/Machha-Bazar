import { getAllProducts, getCategories } from "@/lib/data";
import { Package, CheckCircle, XCircle, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const products = await getAllProducts();
  const categories = await getCategories();

  const stats = [
    { label: "Total products", value: products.length, icon: Package },
    { label: "Active products", value: products.filter((p) => p.isActive).length, icon: CheckCircle },
    { label: "Out of stock", value: products.filter((p) => p.stockStatus === "sold_out").length, icon: XCircle },
    { label: "Categories", value: categories.length, icon: Layers }
  ];

  return (
    <div>
      <h1 className="text-xl font-medium text-plum mb-1">Overview</h1>
      <p className="text-sm text-ink-muted mb-6">AquaRealm Fish admin dashboard</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-cream-soft rounded-xl p-4">
            <stat.icon size={18} className="text-berry-dark mb-2" />
            <div className="text-2xl font-medium text-plum">{stat.value}</div>
            <div className="text-xs text-ink-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
