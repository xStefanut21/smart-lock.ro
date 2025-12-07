"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
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
  }, []);

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
        <ul className="mt-4 space-y-3 text-xs">
          {items!.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3"
            >
              <a
                href={`/products/${item.slug}`}
                className="flex flex-1 items-center gap-3 hover:text-white"
              >
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-neutral-500">Fără imagine</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-neutral-100">{item.name}</p>
                  <p className="text-[11px] text-neutral-400">
                    {new Intl.NumberFormat("ro-RO", {
                      style: "currency",
                      currency: "RON",
                    }).format(item.price)}
                  </p>
                </div>
              </a>
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
                className="text-[11px] text-red-400 hover:text-red-300"
              >
                Șterge
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
