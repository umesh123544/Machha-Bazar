"use client";

import { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Package, Wallet } from "lucide-react";

type AnalyticsData = {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  revenueTotal: number;
  ordersCount: number;
  itemsSoldTotal: number;
  avgOrderValue: number;
  dailyRevenue: { date: string; revenue: number }[];
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[];
  recentOrders: { id: string; customerName: string; totalPrice: number; itemCount: number; createdAt: string }[];
};

function formatRs(n: number) {
  return `Rs. ${n.toLocaleString("en-IN")}`;
}

function formatDayLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json()).message || "Failed to load");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!data) {
    return <p className="text-sm text-ink-muted">Loading analytics...</p>;
  }

  const maxDaily = Math.max(1, ...data.dailyRevenue.map((d) => d.revenue));

  const stats = [
    { label: "Revenue today", value: formatRs(data.revenueToday), icon: Wallet },
    { label: "Revenue this week", value: formatRs(data.revenueWeek), icon: TrendingUp },
    { label: "Revenue this month", value: formatRs(data.revenueMonth), icon: TrendingUp },
    { label: "Total revenue", value: formatRs(data.revenueTotal), icon: Wallet },
    { label: "Total orders", value: data.ordersCount.toLocaleString(), icon: ShoppingBag },
    { label: "Items sold", value: data.itemsSoldTotal.toLocaleString(), icon: Package },
    { label: "Avg. order value", value: formatRs(data.avgOrderValue), icon: TrendingUp }
  ];

  return (
    <div>
      <h1 className="text-xl font-medium text-plum mb-1">Sales Analytics</h1>
      <p className="text-sm text-ink-muted mb-6">Revenue and order trends for Maccha Bazar.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-cream-soft rounded-xl p-4">
            <stat.icon size={18} className="text-berry-dark mb-2" />
            <div className="text-lg sm:text-xl font-medium text-plum truncate">{stat.value}</div>
            <div className="text-xs text-ink-muted mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue chart (last 14 days) */}
      <div className="bg-white border border-cream-soft rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-plum mb-4">Revenue — last 14 days</h2>
        {data.dailyRevenue.every((d) => d.revenue === 0) ? (
          <p className="text-sm text-ink-muted py-8 text-center">No orders yet in this period.</p>
        ) : (
          <div className="flex items-end gap-1.5 h-40">
            {data.dailyRevenue.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                <div className="w-full flex items-end justify-center" style={{ height: "128px" }}>
                  <div
                    className="w-full bg-berry hover:bg-berry-dark rounded-t transition-colors"
                    style={{ height: `${Math.max(3, (d.revenue / maxDaily) * 128)}px` }}
                    title={`${formatDayLabel(d.date)}: ${formatRs(d.revenue)}`}
                  />
                </div>
                <span className="text-[9px] text-ink-muted rotate-0 whitespace-nowrap">
                  {formatDayLabel(d.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white border border-cream-soft rounded-xl p-5">
          <h2 className="text-sm font-medium text-plum mb-4">Top-selling products</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-ink-muted">No sales yet.</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-ink-muted w-4 shrink-0">{i + 1}.</span>
                    <span className="text-plum truncate">{p.name}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-plum font-medium">{p.quantity} sold</span>
                    <span className="text-ink-muted text-xs block">{formatRs(p.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white border border-cream-soft rounded-xl p-5">
          <h2 className="text-sm font-medium text-plum mb-4">Recent orders</h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-ink-muted">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="text-plum truncate">{o.customerName}</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-plum font-medium">{formatRs(o.totalPrice)}</span>
                    <span className="text-ink-muted text-xs block">{o.itemCount} items</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
