import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getOrdersByCustomerId } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentCustomer();
  if (!session) {
    return NextResponse.json({ orders: [] }, { status: 401 });
  }
  try {
    const orders = await getOrdersByCustomerId(session.customerId);
    return NextResponse.json({ orders });
  } catch (err) {
    console.error("customer orders error", err);
    return NextResponse.json({ orders: [] });
  }
}
