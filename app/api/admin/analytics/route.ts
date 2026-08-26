import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getAllCustomerOrders, getAllProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

function dayKey(iso: string) {
  return iso.slice(0, 10); // YYYY-MM-DD
}

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [orders, products] = await Promise.all([
      getAllCustomerOrders(5000),
      getAllProducts()
    ]);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6); // last 7 days incl. today
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let revenueToday = 0;
    let revenueWeek = 0;
    let revenueMonth = 0;
    let revenueTotal = 0;
    let itemsSoldTotal = 0;

    const revenueByDay = new Map<string, number>();
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

    for (const order of orders) {
      const createdAt = new Date(order.createdAt);
      revenueTotal += order.totalPrice;
      itemsSoldTotal += order.itemCount;

      if (createdAt >= startOfToday) revenueToday += order.totalPrice;
      if (createdAt >= startOfWeek) revenueWeek += order.totalPrice;
      if (createdAt >= startOfMonth) revenueMonth += order.totalPrice;

      const key = dayKey(order.createdAt);
      revenueByDay.set(key, (revenueByDay.get(key) || 0) + order.totalPrice);

      for (const item of order.items) {
        const existing = productSales.get(item.productId) || {
          name: item.name,
          quantity: 0,
          revenue: 0
        };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        productSales.set(item.productId, existing);
      }
    }

    // last 14 days, oldest first, filling in zero-revenue days
    const dailyRevenue: { date: string; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyRevenue.push({ date: key, revenue: revenueByDay.get(key) || 0 });
    }

    const topProducts = Array.from(productSales.entries())
      .map(([productId, v]) => ({ productId, ...v }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const recentOrders = orders.slice(0, 8).map((o) => ({
      id: o.id,
      customerName: o.customerName,
      totalPrice: o.totalPrice,
      itemCount: o.itemCount,
      createdAt: o.createdAt
    }));

    return NextResponse.json({
      revenueToday,
      revenueWeek,
      revenueMonth,
      revenueTotal,
      ordersCount: orders.length,
      itemsSoldTotal,
      avgOrderValue: orders.length ? Math.round(revenueTotal / orders.length) : 0,
      dailyRevenue,
      topProducts,
      recentOrders,
      productsCount: products.length
    });
  } catch (err) {
    console.error("admin analytics error", err);
    return NextResponse.json({ message: "Could not load analytics." }, { status: 500 });
  }
}
