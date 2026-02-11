"use client";

import { useState, useEffect, useRef } from "react";

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function ImageZoomModal({ isOpen, onClose, imageUrl, alt, onNavigate }: ImageZoomModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onNavigate?.('prev');
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNavigate?.('next');
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((prevScale) => {
        const newScale = prevScale + delta;
        return Math.min(Math.max(0.5, newScale), 3); // Min 0.5x, Max 3x
      });
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      const container = containerRef.current;
      if (container) {
        container.addEventListener("wheel", handleWheel, { passive: false });
      }
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const container = containerRef.current;
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Reset zoom when image changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    setScale(scale === 1 ? 2 : 1);
    if (scale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div 
        ref={containerRef}
        className="relative max-w-4xl max-h-[90vh] w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors z-10"
          aria-label="Închide zoom"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex items-center justify-center bg-black rounded-lg overflow-hidden" style={{ height: '80vh' }}>
          <img
            ref={imageRef}
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain cursor-move transition-transform"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
            }}
            onDoubleClick={handleDoubleClick}
            draggable={false}
          />
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="text-white text-sm bg-black/50 rounded px-3 py-1">
            Zoom: {Math.round(scale * 100)}% • Rotița mouse pentru zoom • Dublu-click pentru reset
          </div>
          <div className="text-white text-sm bg-black/50 rounded px-3 py-1">
            ESC sau click în afara pentru a închide • Săgeți pentru navigare
          </div>
        </div>

        {scale > 1 && (
          <button
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition-colors"
            aria-label="Reset zoom"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        )}

        {/* Digital navigation arrows */}
        {onNavigate && (
          <>
            <button
              onClick={() => onNavigate('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 transition-colors"
              aria-label="Imagine anterioară"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => onNavigate('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 transition-colors"
              aria-label="Imagine următoare"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
