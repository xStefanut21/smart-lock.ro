"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  color_options?: string | null;
  category_id?: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  sort_order?: number | null;
  is_active?: boolean | null;
}

interface Props {
  products: Product[];
  categories: Category[];
}

export function ProductsListingClient({ products, categories }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [productsPerPage, setProductsPerPage] = useState(18);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [sortByPrice, setSortByPrice] = useState<"none" | "asc" | "desc">("none");

  const prices = products.map((p) => p.price);
  const globalMin = prices.length ? Math.min(...prices) : 0;
  const globalMax = prices.length ? Math.max(...prices) : 0;

  const [minPrice, setMinPrice] = useState(globalMin);
  const [maxPrice, setMaxPrice] = useState(globalMax);

  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((p) => (p.brand?.trim() ? p.brand.trim() : null))
            .filter(Boolean) as string[]
        )
      ).sort(),
    [products]
  );

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const hasActiveFilters =
    selectedCategoryId !== null ||
    selectedBrands.length > 0 ||
    minPrice !== globalMin ||
    maxPrice !== globalMax;

  // sincronizăm categoria selectată cu URL-ul (?category=slug sau /products/categories/slug)
  useEffect(() => {
    let slug = searchParams.get("category");

    // dacă nu există query, încercăm să extragem slug-ul din path: /products/categories/[slug]
    if (!slug) {
      const segments = pathname.split("/").filter(Boolean);
      if (segments[0] === "products" && segments[1] === "categories" && segments[2]) {
        slug = segments[2];
      }
    }

    if (!slug) {
      setSelectedCategoryId(null);
      setCurrentPage(1);
      return;
    }

    const category = categories.find((c) => c.slug === slug);
    setSelectedCategoryId(category ? category.id : null);
    setCurrentPage(1);
  }, [searchParams, categories, pathname]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const inPriceRange =
        (minPrice === 0 || p.price >= minPrice) &&
        (maxPrice === 0 || p.price <= maxPrice);

      const brandName = p.brand?.trim() || null;
      const inBrand =
        selectedBrands.length === 0 ||
        (brandName && selectedBrands.includes(brandName));

      const inCategory =
        !selectedCategoryId || p.category_id === selectedCategoryId;

      return inPriceRange && inBrand && inCategory;
    });
  }, [products, minPrice, maxPrice, selectedBrands, selectedCategoryId]);

  const filteredAndSorted = useMemo(() => {
    if (sortByPrice === "none") return filtered;

    const copy = [...filtered];
    copy.sort((a, b) => {
      const ap = typeof a.price === "number" ? a.price : 0;
      const bp = typeof b.price === "number" ? b.price : 0;
      return sortByPrice === "asc" ? ap - bp : bp - ap;
    });
    return copy;
  }, [filtered, sortByPrice]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / productsPerPage));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * productsPerPage;
  const pageItems = filteredAndSorted.slice(start, start + productsPerPage);

  function toggleBrand(brand: string) {
    setCurrentPage(1);
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }

  function handleMinChange(value: number) {
    const v = Math.min(value, maxPrice);
    setCurrentPage(1);
    setMinPrice(v);
  }

  function handleMaxChange(value: number) {
    const v = Math.max(value, minPrice);
    setCurrentPage(1);
    setMaxPrice(v);
  }

  function handleResetFilters() {
    // resetăm intervalul de preț
    setMinPrice(globalMin);
    setMaxPrice(globalMax);

    // resetăm producătorii
    setSelectedBrands([]);

    // resetăm categoria și URL-ul legat de categorie
    handleCategoryClick(null);

    setCurrentPage(1);
  }

  function handleCategoryClick(slug: string | null) {
    // Pentru consistență, folosim mereu ruta /products/categories/[slug]
    // pentru o categorie selectată și /products când este eliminată categoria.
    if (!slug) {
      router.push("/products");
      return;
    }

    router.push(`/products/categories/${encodeURIComponent(slug)}`);
  }

  return (
    <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
      {/* Sidebar filtre */}
      <aside className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-200">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">Preț</h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded border border-neutral-700 px-2 py-1 text-[11px] text-neutral-300 hover:border-blue-500 hover:text-white"
            >
              Șterge filtre
            </button>
          )}
        </div>
        <div>
          {prices.length === 0 ? (
            <p className="text-[11px] text-neutral-500">Nu sunt produse pentru filtrare.</p>
          ) : (
            <div className="space-y-2">
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-neutral-400">de la</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={minPrice}
                      min={globalMin}
                      max={globalMax}
                      onChange={(e) => handleMinChange(Number(e.target.value) || 0)}
                      className="h-7 w-20 rounded border border-neutral-700 bg-neutral-900 px-2 text-right text-[11px] text-neutral-100 outline-none focus:border-blue-500"
                    />
                    <span className="text-neutral-500">Lei</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-neutral-400">până la</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={maxPrice}
                      min={globalMin}
                      max={globalMax}
                      onChange={(e) => handleMaxChange(Number(e.target.value) || 0)}
                      className="h-7 w-20 rounded border border-neutral-700 bg-neutral-900 px-2 text-right text-[11px] text-neutral-100 outline-none focus:border-blue-500"
                    />
                    <span className="text-neutral-500">Lei</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <input
                  type="range"
                  min={globalMin}
                  max={globalMax}
                  value={minPrice}
                  onChange={(e) => handleMinChange(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer accent-red-500"
                />
                <input
                  type="range"
                  min={globalMin}
                  max={globalMax}
                  value={maxPrice}
                  onChange={(e) => handleMaxChange(Number(e.target.value))}
                  className="h-1 w-full cursor-pointer accent-red-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-3">
          <h2 className="mb-2 text-sm font-semibold text-white">Producător</h2>
          {brands.length === 0 ? (
            <p className="text-[11px] text-neutral-500">
              Deocamdată produsele nu au producător definit.
            </p>
          ) : (
            <ul className="space-y-1 text-[11px]">
              {brands.map((brand) => (
                <li key={brand} className="flex items-center gap-2">
                  <input
                    id={`brand-${brand}`}
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="h-3 w-3 rounded border-neutral-700 bg-neutral-950 text-red-500"
                  />
                  <label htmlFor={`brand-${brand}`} className="cursor-pointer text-neutral-200">
                    {brand}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Listă produse + controale sus */}
      <section className="space-y-4">
        {/* Butoane categorii vizuale */}
        {categories && categories.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.slug)}
                className={`flex flex-col items-center rounded-md border px-3 py-3 text-center text-xs transition hover:border-blue-500 hover:bg-neutral-900 ${
                  selectedCategoryId === cat.id
                    ? "border-blue-500 bg-neutral-900 text-white"
                    : "border-neutral-800 bg-neutral-950 text-neutral-300"
                }`}
              >
                <div className="mb-2 flex h-24 w-full items-center justify-center overflow-hidden rounded bg-white">
                  {cat.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-[11px] text-neutral-500">Fără imagine</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-blue-400">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-xs text-neutral-300 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] text-neutral-400">
              Arăt {pageItems.length} din {filteredAndSorted.length} produse găsite.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Sortează</span>
              <select
                value={sortByPrice}
                onChange={(e) => {
                  setSortByPrice(e.target.value as "none" | "asc" | "desc");
                  setCurrentPage(1);
                }}
                className="h-8 rounded border border-neutral-700 bg-neutral-900 px-2 text-xs text-neutral-100 outline-none focus:border-blue-500"
              >
                <option value="none">Implicit</option>
                <option value="asc">Preț crescător</option>
                <option value="desc">Preț descrescător</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-neutral-400">Produse pe pagină</span>
              <select
                value={productsPerPage}
                onChange={(e) => {
                  setProductsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-8 rounded border border-neutral-700 bg-neutral-900 px-2 text-xs text-neutral-100 outline-none focus:border-blue-500"
              >
                <option value={12}>12</option>
                <option value={18}>18</option>
                <option value={24}>24</option>
              </select>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-neutral-400">Tip afișare</span>
              <button
                type="button"
                onClick={() => setViewType("grid")}
                className={`flex h-7 w-7 items-center justify-center rounded border text-[11px] ${
                  viewType === "grid"
                    ? "border-red-500 bg-red-600/20 text-red-400"
                    : "border-neutral-700 bg-neutral-900 text-neutral-400"
                }`}
                aria-label="Afișare grilă"
              >
                ■■
              </button>
              <button
                type="button"
                onClick={() => setViewType("list")}
                className={`flex h-7 w-7 items-center justify-center rounded border text-[11px] ${
                  viewType === "list"
                    ? "border-red-500 bg-red-600/20 text-red-400"
                    : "border-neutral-700 bg-neutral-900 text-neutral-400"
                }`}
                aria-label="Afișare listă"
              >
                ≡
              </button>
            </div>
          </div>
        </div>

        <div
          className={
            viewType === "grid"
              ? "grid grid-cols-2 gap-4 md:grid-cols-3"
              : "space-y-3"
          }
        >
          {pageItems.map((product) => {
            const hasColorOptions = !!product.color_options &&
              product.color_options
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean).length > 0;

            return (
            <div
              key={product.id}
              className={`flex rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 shadow-sm transition hover:border-blue-600 hover:shadow-lg ${
                viewType === "grid" ? "flex-col" : "flex-row gap-4"
              }`}
            >
              <div className={viewType === "grid" ? "mb-3 flex flex-1 flex-col" : "flex flex-1 items-start gap-3"}>
                <a
                  href={`/products/${product.slug}`}
                  className={
                    viewType === "grid"
                      ? "flex flex-1 flex-col"
                      : "flex flex-1 items-center gap-4"
                  }
                >
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
                    <h2 className="mb-1 text-sm font-medium text-white line-clamp-2">
                      {product.name}
                    </h2>
                    {product.short_description && (
                      <p className="text-[11px] text-neutral-400 line-clamp-2">
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
                <div className="mt-1 flex justify-end">
                  <WishlistToggleButton
                    productId={product.id}
                    name={product.name}
                    price={product.price}
                    imageUrl={product.image_url ?? null}
                    slug={product.slug}
                  />
                </div>
              </div>
              <div
                className={
                  viewType === "grid"
                    ? "mt-auto"
                    : "flex w-40 flex-col justify-between text-right"
                }
              >
                <p className="text-sm font-semibold text-blue-400">
                  {new Intl.NumberFormat("ro-RO", {
                    style: "currency",
                    currency: "RON",
                  }).format(product.price)}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-400">
                  {typeof product.stock === "number" && product.stock > 0
                    ? `În stoc (${product.stock} buc.)`
                    : "Stoc epuizat"}
                </p>
                {hasColorOptions ? (
                  <a
                    href={`/products/${product.slug}`}
                    className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-blue-500 px-3 py-1.5 text-[13px] font-medium text-blue-400 hover:bg-blue-600/10"
                  >
                    Vezi detalii și alege opțiuni
                  </a>
                ) : (
                  <AddToCartButton
                    productId={product.id}
                    name={product.name}
                    price={product.price}
                    imageUrl={product.image_url ?? null}
                    disabled={
                      !(typeof product.stock === "number" && product.stock > 0)
                    }
                  />
                )}
              </div>
            </div>
          );})}

          {pageItems.length === 0 && (
            <p className="text-sm text-neutral-400">
              Nu am găsit produse pentru filtrele selectate.
            </p>
          )}
        </div>

        {/* Paginare simplă */}
        {totalPages > 1 && (
          <div className="mt-2 flex items-center justify-center gap-3 text-xs text-neutral-300">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded border border-neutral-700 px-2 py-1 text-[11px] disabled:opacity-40"
            >
              « Anterior
            </button>
            <span>
              Pagina {page} din {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded border border-neutral-700 px-2 py-1 text-[11px] disabled:opacity-40"
            >
              Următoarea »
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
