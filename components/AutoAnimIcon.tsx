"use client";

import { useEffect, useRef } from "react";
import type { ComponentType, HTMLAttributes } from "react";

type AnimHandle = { startAnimation: () => void; stopAnimation: () => void };

/**
 * Wraps a `lucide-animated` icon (which by default only animates on hover)
 * so it plays automatically on load, then loops every `intervalMs`.
 * Real third-party MIT-licensed animated icons (lucide-animated, built on Lucide) — no CSS hacks.
 */
export default function AutoAnimIcon({
  icon: Icon,
  size = 20,
  intervalMs = 3200,
  delayMs = 0,
  className = ""
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: ComponentType<any>;
  size?: number;
  intervalMs?: number;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<AnimHandle>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      ref.current?.startAnimation();
      interval = setInterval(() => {
        ref.current?.startAnimation();
      }, intervalMs);
    }, delayMs);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [intervalMs, delayMs]);

  return <Icon ref={ref} size={size} animateOnHover className={className} />;
}
