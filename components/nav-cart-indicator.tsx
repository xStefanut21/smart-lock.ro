"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function NavCartIndicator() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    function syncFromStorage() {
      const raw = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
      if (!raw) {
        setCount(0);
        return;
      }
      try {
        const items = JSON.parse(raw) as { quantity: number }[];
        const total = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCount(total);
      } catch {
        setCount(0);
      }
    }

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  return (
    <button
      type="button"
      onClick={() => router.push("/cart")}
      className="relative flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-white hover:text-white"
      aria-label="Coș de cumpărături"
    >
      {/* icon coș */}
      <svg
        aria-hidden
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 6h2l1.2 9h8.1L18 9H8.5" />
        <circle cx="10" cy="19" r="1.2" />
        <circle cx="16" cy="19" r="1.2" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
