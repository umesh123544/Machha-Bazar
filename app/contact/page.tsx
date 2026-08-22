import type { Metadata } from "next";
import { MessageCircle, Phone, Facebook, Instagram, MapPin, Clock } from "lucide-react";
import { getSiteSettings, getPageContent } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("contact");
  return {
    title: page?.title || "Contact Us",
    description: "Get in touch with Maccha Bazar via WhatsApp, phone, or social media."
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const page = await getPageContent("contact");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-medium text-plum mb-2">
        {page?.title || "Contact us"}
      </h1>
      {page?.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.image}
          alt={page.title || "Contact us"}
          className="w-full h-56 sm:h-72 object-cover rounded-2xl mb-6"
        />
      )}
      <p className="text-sm text-ink-muted mb-8">
        {page?.content || "WhatsApp is the fastest way to reach us."}
      </p>
      <a
        href={`https://wa.me/${settings.whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-berry hover:bg-berry-dark text-berry-text text-sm font-medium rounded-lg py-3 mb-10"
      >
        <MessageCircle size={16} />
        Chat With Us
      </a>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="flex items-center gap-3 bg-white border border-cream-soft rounded-xl p-4">
          <Phone size={18} className="text-berry-dark" />
          <span className="text-sm text-ink">{settings.phone}</span>
        </div>
        <div className="flex items-center gap-3 bg-white border border-cream-soft rounded-xl p-4">
          <MapPin size={18} className="text-berry-dark" />
          <span className="text-sm text-ink">{settings.address}</span>
        </div>
        <div className="flex items-center gap-3 bg-white border border-cream-soft rounded-xl p-4">
          <Clock size={18} className="text-berry-dark" />
          <span className="text-sm text-ink">{settings.businessHours}</span>
        </div>
        <div className="flex items-center gap-3 bg-white border border-cream-soft rounded-xl p-4">
          <div className="flex gap-3">
            <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-berry-dark">
              <Facebook size={18} />
            </a>
            <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-berry-dark">
              <Instagram size={18} />
            </a>
          </div>
          <span className="text-sm text-ink">Follow us</span>
        </div>
      </div>
      <div className="bg-cream-soft rounded-2xl p-6">
        <h2 className="text-sm font-medium text-plum mb-4">Send a message</h2>
        <form className="space-y-3">
          <input type="text" placeholder="Your name" className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5 bg-white" />
          <input type="tel" placeholder="Phone number" className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5 bg-white" />
          <textarea placeholder="Your message" rows={4} className="w-full text-sm rounded-lg border border-cream-soft px-3 py-2.5 bg-white" />
          <button type="submit" className="w-full bg-plum text-cream text-sm font-medium rounded-lg py-2.5">
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}