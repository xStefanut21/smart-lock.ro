"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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

    async function syncFromSupabase(userId: string) {
      const supabase = createSupabaseBrowserClient();
      const { data: dbItems, error: dbError } = await supabase
        .from("wishlists")
        .select("product_id, products(name, price, image_url, slug)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!dbError && dbItems && dbItems.length > 0) {
        const mapped = dbItems
          .map((row: any) => {
            const product = row.products;
            if (!product) return null;
            return {
              id: row.product_id,
              name: product.name,
              price: product.price,
              image_url: product.image_url ?? null,
              slug: product.slug,
            };
          })
          .filter(Boolean);

        if (typeof window !== "undefined") {
          localStorage.setItem("wishlist", JSON.stringify(mapped));
          setCount(mapped.length);
        }
      } else {
        // dacă nu avem nimic în DB pentru user, resetăm local wishlist-ul
        if (typeof window !== "undefined") {
          localStorage.removeItem("wishlist");
        }
        setCount(0);
      }
    }

    const supabase = createSupabaseBrowserClient();

    // 1) Sincronizăm o dată la mount, pentru cazul în care user-ul este deja logat
    supabase.auth
      .getUser()
      .then(({ data }) => {
        const user = data.user;
        if (user) {
          return syncFromSupabase(user.id);
        }
        return undefined;
      })
      .catch(() => {
        // ignorăm erorile, rămânem pe varianta din localStorage
      });

    // 2) Reacționăm instant la login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null;
      if (user) {
        // user logat: sincronizăm wishlist-ul lui din Supabase
        syncFromSupabase(user.id);
      } else {
        // logout: resetăm local wishlist-ul și badge-ul
        if (typeof window !== "undefined") {
          localStorage.removeItem("wishlist");
        }
        setCount(0);
      }
    });

    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => router.push("/account/wishlist")}
      className="relative flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-white hover:text-white"
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
      <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
        {count}
      </span>
    </button>
  );
}
