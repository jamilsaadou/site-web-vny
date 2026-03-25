"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type PreviewableArticleImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  imageClassName?: string;
  frameClassName?: string;
  caption?: string | null;
  priority?: boolean;
};

export function PreviewableArticleImage({
  src,
  alt,
  width,
  height,
  imageClassName,
  frameClassName,
  caption,
  priority = false,
}: PreviewableArticleImageProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "block w-full cursor-zoom-in overflow-hidden rounded-xl border border-[var(--line)] bg-[#f8fafc] transition hover:border-[rgba(19,136,74,0.28)]",
          frameClassName,
        )}
        aria-label="Agrandir l'image"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={cn("mx-auto h-auto max-w-full object-contain", imageClassName)}
        />
      </button>

      {caption ? <figcaption className="px-3 py-2 text-xs text-[var(--muted)]">{caption}</figcaption> : null}

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(8,12,10,0.88)] p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Prévisualisation de l'image"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-white/20 sm:right-6 sm:top-6"
          >
            Fermer
          </button>

          <div
            className="max-h-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              priority
              className="max-h-[88vh] w-auto max-w-full rounded-2xl object-contain"
            />
            {caption ? (
              <p className="mt-3 text-center text-sm text-white/86">{caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
