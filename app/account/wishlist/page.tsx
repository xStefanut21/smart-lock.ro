"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AddToCartButton } from "@/components/add-to-cart-button";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  slug: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[] | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem("wishlist") : null;
        if (!raw) {
          setItems([]);
        } else {
          const parsed = JSON.parse(raw);
          setItems(Array.isArray(parsed) ? parsed : []);
        }
      } catch {
        setItems([]);
      }

      setAuthChecked(true);
    }

    load();
  }, [router]);

  if (!authChecked) {
    // nu afișăm nimic până nu știm dacă utilizatorul este autentificat
    return null;
  }

  const isEmpty = !items || items.length === 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
      <h1 className="mb-1 text-3xl font-semibold text-white">Wish List</h1>
      <p className="mb-6 text-xs text-neutral-400">
        Produsele salvate ca favorite vor apărea aici.
      </p>

      {isEmpty ? (
        <>
          <p className="mb-4 text-xs text-neutral-300">
            Nu ai produse în wish list.
          </p>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="mt-2 w-full rounded-md bg-neutral-800 py-2 text-center text-sm font-medium text-neutral-100 hover:bg-neutral-700"
          >
            Continuă
          </button>
        </>
      ) : (
        <ul className="mt-4 space-y-4 text-xs">
          {items!.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-950/90 p-4 shadow-sm md:flex-row md:items-center"
            >
              <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <a
                  href={`/products/${item.slug}`}
                  className="flex flex-1 items-center gap-4 hover:text-white"
                >
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-neutral-500">Fără imagine</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-neutral-100">{item.name}</p>
                    <p className="inline-flex items-center rounded-sm bg-emerald-700/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      În stoc
                    </p>
                    <div className="max-w-xs">
                      <AddToCartButton
                        productId={item.id}
                        name={item.name}
                        price={item.price}
                        imageUrl={item.image_url ?? null}
                        disabled={false}
                      />
                    </div>
                  </div>
                </a>
                <div className="mt-2 flex items-center justify-between gap-4 md:mt-0 md:flex-col md:items-end md:justify-center">
                  <p className="text-sm font-semibold text-blue-400">
                    {new Intl.NumberFormat("ro-RO", {
                      style: "currency",
                      currency: "RON",
                    }).format(item.price)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const raw = localStorage.getItem("wishlist");
                      const current = raw ? (JSON.parse(raw) as WishlistItem[]) : [];
                      const next = current.filter((i) => i.id !== item.id);
                      localStorage.setItem("wishlist", JSON.stringify(next));
                      setItems(next);
                      window.dispatchEvent(
                        new StorageEvent("storage", {
                          key: "wishlist",
                          newValue: JSON.stringify(next),
                        })
                      );
                    }}
                    className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-red-300"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[11px] text-neutral-100">
                      ×
                    </span>
                    <span>șterge articol</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
