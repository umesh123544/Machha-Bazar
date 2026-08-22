import type { Metadata } from "next";
import { getPageContent } from "@/lib/data";

export const dynamic = "force-dynamic";

type CarePoint = { title: string; text: string };

function getCarePoints(content: string): CarePoint[] {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed
        .map((p) => ({
          title: typeof p?.title === "string" ? p.title : "",
          text: typeof p?.text === "string" ? p.text : ""
        }))
        .filter((p) => p.title.trim() || p.text.trim());
    }
  } catch {
    // legacy plain-text content — fall through
  }
  // Legacy fallback: old content was plain paragraphs separated by blank lines, no headings.
  return (content || "")
    .split("\n\n")
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ title: "", text }));
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("care-guide");
  return {
    title: page?.title || "Fish Care Guide",
    description: "Care tips for aquarium fish from Maccha Bazar."
  };
}

export default async function CareGuidePage() {
  const page = await getPageContent("care-guide");
  const points = getCarePoints(page?.content || "");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-medium text-plum mb-6">
        {page?.title || "Fish Care Guide"}
      </h1>
      {page?.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.image}
          alt={page.title || "Fish Care Guide"}
          className="w-full h-56 sm:h-72 object-cover rounded-2xl mb-8"
        />
      )}
      <div className="space-y-6">
        {points.map((point, i) => (
          <div key={i}>
            {point.title && (
              <h2 className="text-lg font-medium text-plum mb-2">{point.title}</h2>
            )}
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">{point.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
