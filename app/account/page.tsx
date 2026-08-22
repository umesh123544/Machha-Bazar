import Link from "next/link";
import { User } from "lucide-react";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-20 text-center">
      <User size={40} className="mx-auto text-berry-dark mb-4" />
      <h1 className="text-xl font-medium text-plum mb-2">Account</h1>
      <p className="text-sm text-ink-muted mb-6">
        Customer accounts and order history are coming soon. For now, place orders through your
        cart and WhatsApp, and message us for any order questions.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/shop"
          className="text-sm font-medium bg-berry hover:bg-berry-dark text-berry-text rounded-lg px-5 py-2.5"
        >
          Continue Shopping
        </Link>
        <a
          href={`https://wa.me/${settings.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium border border-cream-soft text-plum rounded-lg px-5 py-2.5 hover:border-berry"
        >
          Message Us
        </a>
      </div>
    </div>
  );
}
