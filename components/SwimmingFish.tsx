import { Fish, Waves } from "lucide-react";

export default function SwimmingFish({
  size = 48,
  className = "",
  waveClassName = ""
}: {
  size?: number;
  className?: string;
  waveClassName?: string;
}) {
  return (
    <div className="relative inline-flex flex-col items-center">
      <Fish size={size} className={`icon-swim ${className}`} />
      <Waves
        size={Math.round(size * 0.55)}
        className={`text-amber/50 -mt-1 icon-float ${waveClassName}`}
      />
    </div>
  );
}
