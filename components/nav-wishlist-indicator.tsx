"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function NavWishlistIndicator() {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    function syncFromStorage() {
      const raw = typeof window !== "undefined" ? localStorage.getItem("wishlist") : null;
      if (!raw) {
        setCount(0);
        return;
      }
      try {
        const items = JSON.parse(raw) as { id: string }[];
        setCount(items.length);
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
      onClick={() => router.push("/account/wishlist")}
      className="relative hidden h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-white hover:text-white sm:flex"
      aria-label="Favorite"
    >
      <svg
        aria-hidden
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19s-4.5-2.7-6.7-5C3.2 11.8 3 9.2 4.5 7.6 5.9 6 8.3 6.2 9.7 7.6L12 9.9l2.3-2.3c1.4-1.4 3.8-1.6 5.2 0 1.5 1.6 1.3 4.2-.8 6.4-2.2 2.3-6.7 5-6.7 5z" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}
