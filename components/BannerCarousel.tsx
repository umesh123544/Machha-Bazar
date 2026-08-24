"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, ChevronLeft, ChevronRight, Fish } from "lucide-react";
import type { BannerSlide } from "@/lib/types";

export default function BannerCarousel({
  slides,
  whatsappNumber
}: {
  slides: BannerSlide[];
  whatsappNumber: string;
}) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = slides.length;

  function goTo(i: number) {
    setIndex(((i % count) + count) % count);
  }

  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 5500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count]);

  function restartTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 5500);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      goTo(index + (dx < 0 ? 1 : -1));
      restartTimer();
    }
    touchStartX.current = null;
  }

  if (count === 0) return null;

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== index}
          className={`bg-plum px-6 sm:px-12 py-14 sm:py-20 relative overflow-hidden bg-cover bg-center transition-opacity duration-500 ${
            i === index ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"
          }`}
          style={slide.image ? { backgroundImage: `linear-gradient(rgba(45,20,45,0.72), rgba(45,20,45,0.72)), url(${slide.image})` } : undefined}
        >
          {slide.badge && (
            <span className="inline-block text-xs font-medium text-amber bg-amber/10 px-3 py-1.5 rounded-full mb-5">
              {slide.badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-5xl font-medium text-cream leading-tight max-w-xl mb-4">
            {slide.headline}
          </h1>
          {slide.subheading && (
            <p className="text-sm sm:text-base text-cream/60 max-w-md mb-8">{slide.subheading}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="bg-berry hover:bg-berry-dark text-berry-text text-sm font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Shop Available Fish
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-cream/25 text-cream text-sm font-medium px-6 py-3 rounded-lg hover:bg-cream/5 transition-colors"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          </div>
          {!slide.image && <Fish className="absolute -right-4 -bottom-6 text-amber/5" size={260} aria-hidden />}
        </div>
      ))}

      {count > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => {
              goTo(index - 1);
              restartTimer();
            }}
            className="hidden sm:flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-cream/15 text-cream hover:bg-cream/25 backdrop-blur-sm transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => {
              goTo(index + 1);
              restartTimer();
            }}
            className="hidden sm:flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-cream/15 text-cream hover:bg-cream/25 backdrop-blur-sm transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => {
                  goTo(i);
                  restartTimer();
                }}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-cream" : "w-1.5 bg-cream/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
