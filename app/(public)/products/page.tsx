import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductsListingClient } from "@/components/products-listing-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Produse",
};

export default async function ProductsPage() {
  const supabase = createSupabaseServerClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, short_description, slug, image_url, brand, stock, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">Yale smart pentru casa ta</h1>
        <p className="text-sm text-neutral-400">
          Catalog de yale smart dedicate locuințelor din România. Prețuri cu TVA inclus.
        </p>
      </header>

      {products && products.length > 0 ? (
        <ProductsListingClient products={products} />
      ) : (
        <p className="text-sm text-neutral-400">Nu sunt produse disponibile încă.</p>
      )}
    </div>
  );
}
