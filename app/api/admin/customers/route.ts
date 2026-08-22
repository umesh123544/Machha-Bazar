import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getAllCustomers, getAllCustomerOrders, getCustomerOrderCounts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [customers, orders, counts] = await Promise.all([
      getAllCustomers(),
      getAllCustomerOrders(50),
      getCustomerOrderCounts()
    ]);

    const list = customers.map((c) => ({
      ...c,
      orderCount: counts[c.id] || 0
    }));

    return NextResponse.json({ customers: list, recentOrders: orders });
  } catch (err) {
    console.error("admin customers error", err);
    return NextResponse.json(
      {
        message:
          "Could not load customers. Run migration_8.sql in Supabase if tables are missing."
      },
      { status: 500 }
    );
  }
}
