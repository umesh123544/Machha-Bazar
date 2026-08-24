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
    // Swipe left (finger moves right-to-left) -> go to next slide.
    // Swipe right (finger moves left-to-right) -> go to previous slide.
    if (Math.abs(dx) > 40) {
      goTo(index + (dx < 0 ? 1 : -1));
      restartTimer();
    }
    touchStartX.current = null;
  }

  if (count === 0) return null;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-cream-soft"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Text: left */}
              <div className="bg-cream-soft px-6 sm:px-10 py-14 sm:py-20 flex flex-col justify-center order-2 sm:order-1">
                {slide.badge && (
                  <span className="inline-block text-xs font-medium text-berry-dark bg-berry/10 px-3 py-1.5 rounded-full mb-5 w-fit">
                    {slide.badge}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl font-medium text-plum leading-tight mb-4">{slide.headline}</h1>
                {slide.subheading && (
                  <p className="text-sm sm:text-base text-ink-muted max-w-md mb-8">{slide.subheading}</p>
                )}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="bg-berry hover:bg-berry-dark text-white text-sm font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    Shop Available Fish
                  </Link>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 border border-plum/20 text-plum text-sm font-medium px-6 py-3 rounded-lg hover:bg-plum/5 transition-colors"
                  >
                    <MessageCircle size={16} />
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              {/* Image: right */}
              <div
                className="bg-plum min-h-[220px] sm:min-h-0 bg-cover bg-center order-1 sm:order-2 relative overflow-hidden"
                style={slide.image ? { backgroundImage: `url(${slide.image})` } : undefined}
              >
                {!slide.image && <Fish className="absolute inset-0 m-auto text-amber/10" size={180} aria-hidden />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => {
              goTo(index - 1);
              restartTimer();
            }}
            className="hidden sm:flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-plum/15 text-plum hover:bg-plum/25 backdrop-blur-sm transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => {
              goTo(index + 1);
              restartTimer();
            }}
            className="hidden sm:flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-plum/15 text-plum hover:bg-plum/25 backdrop-blur-sm transition-colors"
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
                  i === index ? "w-6 bg-plum" : "w-1.5 bg-plum/30"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
