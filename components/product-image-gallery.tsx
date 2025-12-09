"use client";

import { useState, TouchEvent } from "react";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

export function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const safeIndex = ((current % images.length) + images.length) % images.length;

  function goTo(index: number) {
    setCurrent(((index % images.length) + images.length) % images.length);
  }

  function next() {
    goTo(safeIndex + 1);
  }

  function prev() {
    goTo(safeIndex - 1);
  }

  function handleTouchStart(e: TouchEvent<HTMLDivElement>) {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  }

  function handleTouchEnd(e: TouchEvent<HTMLDivElement>) {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0]?.clientX - touchStartX;
    if (Math.abs(diff) < 40) return;
    if (diff < 0) {
      next();
    } else {
      prev();
    }
  }

  if (images.length === 1) {
    return (
      <div className="w-full max-w-sm flex-shrink-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm flex-shrink-0">
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-950"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[safeIndex]}
          alt={alt}
          className="absolute inset-0 h-full w-full object-contain"
        />
        <button
          type="button"
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1 text-xs text-white hover:bg-black/80"
          aria-label="Imagine anterioară"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1 text-xs text-white hover:bg-black/80"
          aria-label="Imagine următoare"
        >
          ›
        </button>
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className={`h-1.5 w-3 rounded-full border border-neutral-500 transition-colors ${
                index === safeIndex ? "bg-white" : "bg-neutral-800"
              }`}
              aria-label={`Vezi imaginea ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
