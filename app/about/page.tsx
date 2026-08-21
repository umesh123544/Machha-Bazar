import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story behind Maccha Bazar, a home-based aquarium fish breeder in Kathmandu Valley."
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-medium text-plum mb-6">About Maccha Bazar</h1>
      <div className="space-y-4 text-sm sm:text-base text-ink-muted leading-relaxed">
        <p>
          Maccha Bazar started with a simple passion for aquarium fish and home breeding. What began as a
          small home setup has grown into a dedicated effort to raise healthy, colorful fish for local
          aquarium keepers.
        </p>
        <p>
          We currently focus on raising and providing healthy Guppy fish while building a trusted local
          aquarium community. Every fish is raised in carefully maintained tanks, with attention to water
          quality, feeding, and space, so they arrive at your home in strong condition.
        </p>
        <p>
          Our goal is to make it easier for aquarium lovers in Kathmandu Valley to find healthy fish and get
          reliable guidance for caring for them. As we grow, we plan to expand into more fish varieties,
          aquarium plants, and equipment, always with the same focus on quality and honest information.
        </p>
      </div>
    </div>
  );
}
