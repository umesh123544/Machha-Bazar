import type { Metadata } from "next";
import { BookOpen, Droplet, Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Fish Care Guide",
  description: "Beginner and Guppy-specific aquarium care guides from Maccha Bazar."
};

const guides = [
  {
    icon: BookOpen,
    title: "Beginner guide",
    desc: "How to set up an aquarium, introduce new fish, and manage basic water care.",
    points: ["Setting up your first tank", "Introducing new fish safely", "Basic water care routine"]
  },
  {
    icon: Droplet,
    title: "Guppy care",
    desc: "Feeding, breeding, and telling males and females apart.",
    points: ["Guppy feeding schedule", "Male vs female differences", "Breeding basics", "Water requirements", "Recommended tank size"]
  },
  {
    icon: Wrench,
    title: "Aquarium maintenance",
    desc: "Keeping your tank clean and your fish healthy long term.",
    points: ["Water change routine", "Cleaning your filter and substrate", "Feeding schedule", "Common beginner mistakes"]
  }
];

export default function CareGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
      <h1 className="text-2xl sm:text-3xl font-medium text-plum mb-2">Fish care guide</h1>
      <p className="text-sm text-ink-muted mb-10">Practical guidance for keeping healthy fish at home.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <div key={guide.title} className="bg-white rounded-2xl border border-cream-soft p-6">
            <guide.icon className="text-berry-dark mb-3" size={22} />
            <h2 className="text-base font-medium text-plum mb-2">{guide.title}</h2>
            <p className="text-xs text-ink-muted mb-4">{guide.desc}</p>
            <ul className="space-y-2">
              {guide.points.map((point) => (
                <li key={point} className="text-xs text-ink-muted flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-berry mt-1.5 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
