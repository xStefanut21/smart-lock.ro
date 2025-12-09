"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface WishlistToggleButtonProps {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  slug: string;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  slug: string;
}

function readWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("wishlist");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

function writeWishlist(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wishlist", JSON.stringify(items));
  // declanșăm evenimentul storage manual pentru listener-ele locale
  window.dispatchEvent(
    new StorageEvent("storage", { key: "wishlist", newValue: JSON.stringify(items) })
  );
}

export function WishlistToggleButton({
  productId,
  name,
  price,
  imageUrl,
  slug,
}: WishlistToggleButtonProps) {
  const router = useRouter();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const items = readWishlist();
    setActive(items.some((i) => i.id === productId));

    function handleStorage(e: StorageEvent) {
      if (e.key && e.key !== "wishlist") return;
      const next = readWishlist();
      setActive(next.some((i) => i.id === productId));
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [productId]);

  async function toggle() {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const items = readWishlist();
    const exists = items.find((i) => i.id === productId);
    let next: WishlistItem[];

    if (exists) {
      next = items.filter((i) => i.id !== productId);
    } else {
      next = [
        ...items,
        {
          id: productId,
          name,
          price,
          image_url: imageUrl ?? null,
          slug,
        },
      ];
    }

    // actualizăm localStorage + eveniment de storage
    writeWishlist(next);
    setActive(!exists);

    // oglindim modificarea și în tabela wishlists din Supabase, per utilizator
    try {
      if (exists) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } else {
        await supabase.from("wishlists").upsert({
          user_id: user.id,
          product_id: productId,
        });
      }
    } catch (err) {
      // dacă tabela nu există sau apare o eroare, nu blocăm UI-ul; localStorage rămâne sursa de adevăr
      console.error("Wishlist sync failed", err);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? "Scoate din favorite" : "Adaugă la favorite"}
      className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors ${
        active
          ? "border-red-500 bg-red-600/20 text-red-400"
          : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-red-500 hover:text-red-400"
      }`}
    >
      <svg
        aria-hidden
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19s-4.5-2.7-6.7-5C3.2 11.8 3 9.2 4.5 7.6 5.9 6 8.3 6.2 9.7 7.6L12 9.9l2.3-2.3c1.4-1.4 3.8-1.6 5.2 0 1.5 1.6 1.3 4.2-.8 6.4-2.2 2.3-6.7 5-6.7 5z" />
      </svg>
    </button>
  );
}
