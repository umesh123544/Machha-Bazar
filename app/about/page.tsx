import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageContent, getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  if (settings.showAboutPage === false) {
    return { title: "Not Found" };
  }
  const page = await getPageContent("about");
  return {
    title: page?.title || "About Us",
    description: "The story behind Maccha Bazar, a home-based aquarium fish breeder in Kathmandu Valley."
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();
  if (settings.showAboutPage === false) {
    notFound();
  }

  const page = await getPageContent("about");
  const paragraphs = (page?.content || "").split("\n").filter((p) => p.trim());

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-medium text-plum mb-6">
        {page?.title || "About Maccha Bazar"}
      </h1>
      {page?.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.image}
          alt={page.title || "About Maccha Bazar"}
          className="w-full h-56 sm:h-72 object-cover rounded-2xl mb-8"
        />
      )}
      <div className="space-y-4 text-sm sm:text-base text-ink-muted leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
