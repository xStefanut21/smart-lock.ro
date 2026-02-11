"use client";

import { useState, TouchEvent } from "react";
import { ImageZoomModal } from "./image-zoom-modal";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function ProductImageGallery({ images, alt, onNavigate }: ProductImageGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

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
      <>
        <div className="w-full max-w-sm flex-shrink-0">
          <div 
            className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-950 cursor-pointer group"
            onClick={() => setIsZoomOpen(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[0]}
              alt={alt}
              className="absolute inset-0 h-full w-full object-contain transition-transform group-hover:scale-105 pointer-events-none"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 rounded-full p-2">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <ImageZoomModal
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
          imageUrl={images[0]}
          alt={alt}
        />
      </>
    );
  }

  return (
    <>
      <div className="w-full max-w-sm flex-shrink-0">
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-lg bg-neutral-950 cursor-pointer group"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomOpen(true);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[safeIndex]}
            alt={alt}
            className="absolute inset-0 h-full w-full object-contain transition-transform group-hover:scale-105 pointer-events-none"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 rounded-full p-2">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1 text-xs text-white hover:bg-black/80"
            aria-label="Imagine anterioară"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(index);
                }}
                className={`h-1.5 w-3 rounded-full border border-neutral-500 transition-colors ${
                  index === safeIndex ? "bg-white" : "bg-neutral-800"
                }`}
                aria-label={`Vezi imaginea ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      <ImageZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        imageUrl={images[safeIndex]}
        alt={alt}
        onNavigate={images.length > 1 ? (direction) => {
          if (direction === 'prev') {
            prev();
          } else {
            next();
          }
        } : undefined}
      />
    </>
  );
}
