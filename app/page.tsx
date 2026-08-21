import Link from "next/link";
import { MessageCircle, Egg, Camera, Truck, Fish } from "lucide-react";
import { getActiveProducts, getCategories, getSiteSettings } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import InstallPWA from "@/components/InstallPWA";
import { whatsappLink, buildInquiryMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getActiveProducts();
  const featured = products.filter((p) => p.isFeatured).slice(0, 3);
  const shown = featured.length ? featured : products.slice(0, 3);
  const categories = await getCategories();
  const comingSoon = categories.filter((c) => c.comingSoon);
  const settings = await getSiteSettings();

  const steps = [
    { n: "01", title: "Choose your fish", desc: "Browse available fish." },
    { n: "02", title: "Send your order", desc: "Message us through WhatsApp." },
    { n: "03", title: "Confirm details", desc: "We confirm availability, price and delivery." },
    { n: "04", title: "Receive your fish", desc: "Get your fish delivered safely." }
  ];

  const why = [
    { icon: Egg, title: "Home bred", desc: "Fish are raised with care in a controlled home environment." },
    { icon: Fish, title: "Carefully raised", desc: "We focus on maintaining healthy fish and proper aquarium conditions." },
    { icon: Camera, title: "Real fish photos", desc: "We use actual product photos whenever possible." },
    { icon: Truck, title: "Valley delivery", desc: "Convenient live fish delivery inside Kathmandu Valley." }
  ];

  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-14">
        <div
          className="bg-plum rounded-2xl px-6 sm:px-12 py-14 sm:py-20 relative overflow-hidden bg-cover bg-center"
          style={settings.bannerImage ? { backgroundImage: `linear-gradient(rgba(45,20,45,0.72), rgba(45,20,45,0.72)), url(${settings.bannerImage})` } : undefined}
        >
          <span className="inline-block text-xs font-medium text-amber bg-amber/10 px-3 py-1.5 rounded-full mb-5">
            {settings.bannerBadge}
          </span>
          <h1 className="text-3xl sm:text-5xl font-medium text-cream leading-tight max-w-xl mb-4">
            {settings.bannerHeadline}
          </h1>
          <p className="text-sm sm:text-base text-cream/60 max-w-md mb-2">
            {settings.bannerSubheading}
          </p>
          <p className="text-xs sm:text-sm text-amber/80 mb-8">
            Home-bred fish &middot; Real photos &middot; Kathmandu Valley delivery
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="bg-berry hover:bg-berry-dark text-berry-text text-sm font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Shop Available Fish
            </Link>
            <a
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-cream/25 text-cream text-sm font-medium px-6 py-3 rounded-lg hover:bg-cream/5 transition-colors"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>
          {!settings.bannerImage && <Fish className="absolute -right-4 -bottom-6 text-amber/5" size={260} aria-hidden />}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-medium text-plum">Available now</h2>
            <p className="text-sm text-ink-muted">Explore our currently available aquarium fish.</p>
          </div>
          <Link href="/shop" className="text-sm text-berry-dark font-medium hidden sm:block">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {shown.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-cream-soft py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-medium text-plum mb-8 text-center">Why choose Maccha Bazar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {why.map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-5 text-center border border-cream-soft">
                <item.icon className="mx-auto mb-3 text-berry-dark" size={22} />
                <div className="text-sm font-medium text-plum mb-1">{item.title}</div>
                <p className="text-xs text-ink-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-xl sm:text-2xl font-medium text-plum mb-8 text-center">How to order</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.n}>
              <div className="text-2xl font-medium text-amber-dark mb-2">{step.n}</div>
              <div className="text-sm font-medium text-plum mb-1">{step.title}</div>
              <p className="text-xs text-ink-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-plum py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg sm:text-xl font-medium text-cream mb-6 text-center">Safe live fish delivery</h2>
          <p className="text-sm text-cream/60 text-center max-w-lg mx-auto mb-6">
            We currently provide live fish delivery inside Kathmandu Valley, covering {settings.deliveryAreas.join(", ")}.
            {" "}{settings.deliveryNote}
          </p>
          <div className="flex justify-center">
            <Link href="/delivery" className="text-sm font-medium text-amber border border-amber/30 px-5 py-2.5 rounded-lg hover:bg-amber/10">
              Check Delivery Availability
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-xl sm:text-2xl font-medium text-plum mb-8 text-center">More coming soon</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {comingSoon.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-cream-soft p-5 text-center">
              <div className="text-sm font-medium text-plum mb-2">{cat.name}</div>
              <span className="text-[10px] font-medium text-amber-dark bg-[#FAEEDA] px-2.5 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream-soft py-16 text-center px-4">
        <h2 className="text-xl sm:text-2xl font-medium text-plum mb-2">Looking for a specific fish?</h2>
        <p className="text-sm text-ink-muted mb-6 max-w-md mx-auto">
          Can&apos;t find what you&apos;re looking for? Message us and ask about current availability.
        </p>
        <a
          href={whatsappLink(settings.whatsappNumber, buildInquiryMessage(settings.businessName, "a specific fish"))}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-berry hover:bg-berry-dark text-berry-text text-sm font-medium px-6 py-3 rounded-lg"
        >
          <MessageCircle size={16} />
          Chat on WhatsApp
        </a>
      </section>
      <InstallPWA />
    </div>
  );
}
