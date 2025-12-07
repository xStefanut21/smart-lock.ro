"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AdminProduct = {
  id: string;
  name: string;
  price: number;
  slug: string;
  short_description: string | null;
  image_url: string | null;
  brand: string | null;
  stock: number | null;
  is_active: boolean | null;
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/admin/products");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile || profile.is_admin !== true) {
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, price, slug, short_description, image_url, brand, stock, is_active"
        )
        .order("name", { ascending: true });

      if (error) {
        setError("Nu am putut încărca produsele. Încearcă din nou.");
        setLoading(false);
        return;
      }

      setProducts(data ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă lista de produse...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-200">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-xs text-neutral-400 hover:text-white"
      >
        
        ← Înapoi
      </button>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Administrare produse</h1>
          <p className="text-xs text-neutral-400">
            Aici poți vedea și gestiona produsele afișate pe smart-lock.ro.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/products/new")}
          className="self-start rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-500"
        >
          + Adaugă produs nou
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {products.length === 0 ? (
        <p className="text-xs text-neutral-400">
          Nu există încă produse în catalog. Folosește butonul „Adaugă produs nou” pentru a crea primul produs.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/60">
          <table className="min-w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-neutral-800 bg-neutral-950/80 text-neutral-400">
              <tr>
                <th className="px-3 py-2">Produs</th>
                <th className="px-3 py-2">Brand</th>
                <th className="px-3 py-2">Preț</th>
                <th className="px-3 py-2">Stoc</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2 text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-neutral-900/80 hover:bg-neutral-900/60"
                >
                  <td className="px-3 py-2 align-top">
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-10 w-10 flex-shrink-0 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium text-white">{product.name}</div>
                        {product.short_description && (
                          <div className="max-w-xs truncate text-[11px] text-neutral-400">
                            {product.short_description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top text-[11px] text-neutral-300">
                    {product.brand || "-"}
                  </td>
                  <td className="px-3 py-2 align-top text-[11px] text-neutral-300">
                    {product.price.toLocaleString("ro-RO", {
                      style: "currency",
                      currency: "RON",
                    })}
                  </td>
                  <td className="px-3 py-2 align-top text-[11px] text-neutral-300">
                    {typeof product.stock === "number" ? product.stock : "-"}
                  </td>
                  <td className="px-3 py-2 align-top text-[11px]">
                    {product.is_active === false ? (
                      <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                        Dezactivat
                      </span>
                    ) : (
                      <span className="rounded bg-green-900/40 px-2 py-0.5 text-[10px] text-green-300">
                        Activ
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-[11px] text-neutral-400">
                    {product.slug}
                  </td>
                  <td className="px-3 py-2 align-top text-right text-[11px]">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                      className="rounded-md border border-neutral-700 px-2 py-1 text-neutral-200 hover:border-red-500 hover:text-white"
                    >
                      Editează
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
