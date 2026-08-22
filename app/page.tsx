import Link from "next/link";
import { MessageCircle, Egg, Camera, Truck, Fish, Heart, ShieldCheck, Leaf, Star, Droplet, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getActiveProducts, getCategories, getSiteSettings } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import InstallPWA from "@/components/InstallPWA";
import { whatsappLink, buildInquiryMessage } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const ICON_MAP: Record<string, LucideIcon> = {
  Egg,
  Fish,
  Camera,
  Truck,
  Heart,
  ShieldCheck,
  Leaf,
  Star,
  Droplet,
  Sparkles
};

export default async function HomePage() {
  const products = await getActiveProducts();
  const featured = products.filter((p) => p.isFeatured).slice(0, 3);
  const shown = featured.length ? featured : products.slice(0, 3);
  const categories = await getCategories();
  const comingSoon = categories.filter((c) => c.comingSoon);
  const settings = await getSiteSettings();
  const content = settings.homepageContent;

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
            <h2 className="text-xl sm:text-2xl font-medium text-plum">{content.availableTitle}</h2>
            <p className="text-sm text-ink-muted">{content.availableSubtitle}</p>
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
          <h2 className="text-xl sm:text-2xl font-medium text-plum mb-8 text-center">{content.whyTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {content.whyItems.map((item, i) => {
              const Icon = ICON_MAP[item.icon] || Fish;
              return (
                <div key={i} className="bg-white rounded-xl p-5 text-center border border-cream-soft">
                  <Icon className="mx-auto mb-3 text-berry-dark" size={22} />
                  <div className="text-sm font-medium text-plum mb-1">{item.title}</div>
                  <p className="text-xs text-ink-muted">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-xl sm:text-2xl font-medium text-plum mb-8 text-center">{content.howToOrderTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {content.steps.map((step, i) => (
            <div key={i}>
              <div className="text-2xl font-medium text-amber-dark mb-2">{String(i + 1).padStart(2, "0")}</div>
              <div className="text-sm font-medium text-plum mb-1">{step.title}</div>
              <p className="text-xs text-ink-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-plum py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-lg sm:text-xl font-medium text-cream mb-6 text-center">{content.deliveryTitle}</h2>
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
        <h2 className="text-xl sm:text-2xl font-medium text-plum mb-8 text-center">{content.comingSoonTitle}</h2>
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
        <h2 className="text-xl sm:text-2xl font-medium text-plum mb-2">{content.ctaTitle}</h2>
        <p className="text-sm text-ink-muted mb-6 max-w-md mx-auto">
          {content.ctaSubtitle}
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
