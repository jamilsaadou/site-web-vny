"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/media";

type HomeCarouselProps = {
  items: GalleryItem[];
};

export function HomeCarousel({ items }: HomeCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setIndex((value) => (value + 1) % items.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  const active = items[index];

  return (
    <div className="soft-card overflow-hidden lg:shadow-[0_26px_70px_rgba(15,37,26,0.18)]">
      <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[5/4]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.src}
            className="absolute inset-0"
            initial={{ opacity: 0, x: 34 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -34 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={active.src} alt={active.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,18,12,0.74)] via-[rgba(10,18,12,0.2)] to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute right-4 bottom-4 left-4 rounded-xl border border-white/20 bg-black/35 p-4 text-white backdrop-blur-sm sm:p-5">
          <h3 className="display-font text-lg leading-tight font-extrabold sm:text-2xl">{active.title}</h3>
          <p className="mt-2 text-xs leading-6 text-white/88 sm:text-sm">{active.description}</p>
        </div>

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((value) => (value - 1 + items.length) % items.length)}
            className="h-9 w-9 rounded-xl border border-white/30 bg-black/30 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-black/45"
            aria-label="Image précédente"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIndex((value) => (value + 1) % items.length)}
            className="h-9 w-9 rounded-xl border border-white/30 bg-black/30 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-black/45"
            aria-label="Image suivante"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 px-4 py-4">
        {items.map((item, dotIndex) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setIndex(dotIndex)}
            className={`h-2 transition-all ${
              dotIndex === index ? "w-9 rounded-md bg-[var(--orange)]" : "w-3 rounded-sm bg-[rgba(19,136,74,0.25)]"
            }`}
            aria-label={`Aller à l'image ${dotIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
