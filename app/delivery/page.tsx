import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle, Truck } from "lucide-react";
import { getSiteSettings } from "@/lib/data";
import { whatsappLink, buildDeliveryCheckMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  if (settings.showDeliveryPage === false) {
    return { title: "Not Found" };
  }
  return {
    title: "Delivery Information",
    description: "Live fish delivery information for Kathmandu, Lalitpur, and Bhaktapur from Maccha Bazar."
  };
}

export default async function DeliveryPage() {
  const settings = await getSiteSettings();
  if (settings.showDeliveryPage === false) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <Truck className="text-berry-dark mb-4" size={28} />
      <h1 className="text-2xl sm:text-3xl font-medium text-plum mb-3">Safe live fish delivery</h1>
      <p className="text-sm text-ink-muted leading-relaxed mb-6">
        We currently provide live fish delivery inside Kathmandu Valley. Fish are packed carefully to travel
        safely and arrive in healthy condition.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {settings.deliveryAreas.map((area) => (
          <span key={area} className="text-xs font-medium bg-cream-soft text-plum px-3 py-1.5 rounded-full">
            {area}
          </span>
        ))}
      </div>

      <p className="text-sm text-ink-muted mb-8">{settings.deliveryNote}</p>

      <a
        href={whatsappLink(settings.whatsappNumber, buildDeliveryCheckMessage())}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-berry hover:bg-berry-dark text-white text-sm font-medium px-6 py-3 rounded-lg"
      >
        <MessageCircle size={16} />
        Check Delivery Availability
      </a>
    </div>
  );
}
