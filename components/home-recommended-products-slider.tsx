"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";

interface Product {
  id: string;
  name: string;
  price: number;
  short_description?: string | null;
  slug: string;
  image_url?: string | null;
  brand?: string | null;
  stock?: number | null;
}

export function HomeRecommendedProductsSlider() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const { data } = await supabase
        .from("products")
        .select("id, name, price, short_description, slug, image_url, brand, stock")
        .eq("is_active", true)
        .limit(50);

      if (data && data.length > 0) {
        // shuffle random and keep first 12
        const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 12);
        setProducts(shuffled as Product[]);
      }

      setLoading(false);
    }

    load();
  }, []);

  const hasProducts = products.length > 0;
  const pageSize = 4;

  const visibleProducts = useMemo(() => {
    if (!hasProducts) return [];
    const safeStart = Math.min(startIndex, Math.max(0, products.length - 1));
    const slice = products.slice(safeStart, safeStart + pageSize);

    if (slice.length < pageSize && products.length > pageSize) {
      return [...slice, ...products.slice(0, pageSize - slice.length)];
    }

    return slice;
  }, [products, startIndex, hasProducts]);

  function goPrev() {
    if (!hasProducts || isTransitioning) return;
    setDirection("left");
    setIsTransitioning(true);
    setStartIndex((prev) => {
      const total = products.length;
      if (total <= 1) return 0;
      const next = (prev - 1 + total) % total;
      return next;
    });
    setTimeout(() => {
      setIsTransitioning(false);
    }, 220);
  }

  function goNext() {
    if (!hasProducts || isTransitioning) return;
    setDirection("right");
    setIsTransitioning(true);
    setStartIndex((prev) => {
      const total = products.length;
      if (total <= 1) return 0;
      const next = (prev + 1) % total;
      return next;
    });
    setTimeout(() => {
      setIsTransitioning(false);
    }, 220);
  }

  if (!loading && !hasProducts) return null;

  return (
    <section className="mb-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Produse recomandate</h2>
      </div>
      <div className="relative flex items-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-sm text-neutral-200 hover:border-blue-500 hover:text-white"
          aria-label="Produse anterioare"
        >
          ‹
        </button>
        <div className="flex-1 overflow-hidden">
          <div
            className={`grid grid-cols-2 gap-4 md:grid-cols-4 transform transition-transform duration-300 ease-out ${
              isTransitioning
                ? direction === "right"
                  ? "-translate-x-3"
                  : "translate-x-3"
                : "translate-x-0"
            }`}
          >
            {loading && !hasProducts
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-60 w-full rounded-xl border border-neutral-800 bg-neutral-950/80 animate-pulse"
                  />
                ))
              : visibleProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`flex h-full w-full flex-col rounded-xl border border-neutral-800 bg-neutral-950/80 p-3 text-xs text-neutral-200 shadow-sm transition hover:border-blue-600 hover:shadow-lg ${
                      index >= 2 ? "hidden md:flex" : "flex"
                    }`}
                  >
                    <a href={`/products/${product.slug}`} className="flex flex-1 flex-col">
                      <div className="mb-3 w-full">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-black/30">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="absolute inset-0 h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[11px] text-neutral-500">
                              Fără imagine
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-white">
                          {product.name}
                        </h3>
                        {product.short_description && (
                          <p className="line-clamp-2 text-[11px] text-neutral-400">
                            {product.short_description}
                          </p>
                        )}
                        {product.brand && (
                          <p className="mt-1 text-[11px] text-neutral-500">
                            Producător: {product.brand}
                          </p>
                        )}
                      </div>
                    </a>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-blue-400">
                        {new Intl.NumberFormat("ro-RO", {
                          style: "currency",
                          currency: "RON",
                        }).format(product.price)}
                      </p>
                      <WishlistToggleButton
                        productId={product.id}
                        name={product.name}
                        price={product.price}
                        imageUrl={product.image_url ?? null}
                        slug={product.slug}
                      />
                    </div>
                    <div className="mt-1">
                      <AddToCartButton
                        productId={product.id}
                        name={product.name}
                        price={product.price}
                        imageUrl={product.image_url ?? null}
                        disabled={
                          !(typeof product.stock === "number" && product.stock > 0)
                        }
                      />
                    </div>
                  </div>
                ))}
          </div>
        </div>
        <button
          type="button"
          onClick={goNext}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-sm text-neutral-200 hover:border-blue-500 hover:text-white"
          aria-label="Produse următoare"
        >
          ›
        </button>
      </div>
    </section>
  );
}
