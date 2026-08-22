import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getCustomerById } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentCustomer();
  if (!session) {
    return NextResponse.json({ customer: null });
  }
  const customer = await getCustomerById(session.customerId);
  if (!customer) {
    return NextResponse.json({ customer: null });
  }
  return NextResponse.json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      deliveryArea: customer.deliveryArea,
      notes: customer.notes
    }
  });
}
