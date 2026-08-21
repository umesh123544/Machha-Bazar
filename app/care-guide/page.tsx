import type { Metadata } from "next";
import { getPageContent } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("care-guide");
  return {
    title: page?.title || "Fish Care Guide",
    description: "Care tips for aquarium fish from Maccha Bazar."
  };
}

export default async function CareGuidePage() {
  const page = await getPageContent("care-guide");
  const paragraphs = (page?.content || "").split("\n").filter((p) => p.trim());

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-medium text-plum mb-6">
        {page?.title || "Fish Care Guide"}
      </h1>
      <div className="space-y-4 text-sm sm:text-base text-ink-muted leading-relaxed">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}
