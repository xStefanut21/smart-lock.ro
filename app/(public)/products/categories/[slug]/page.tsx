import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductsListingClient } from "@/components/products-listing-client";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createSupabaseServerClient();

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .maybeSingle<{ name: string | null }>();

  const name = category?.name || "Categorie produse";

  return {
    title: `${name} – yale smart și încuietori inteligente | Smart-Lock.ro`,
    description: `Vezi gama de ${name.toLowerCase()}: yale smart, încuietori inteligente și accesorii compatibile cu uși de apartament și casă în România.`,
  };
}

export default async function CategoryProductsPage() {
  const supabase = createSupabaseServerClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, name, price, short_description, slug, image_url, brand, stock, is_active, color_options, category_id"
    )
    .eq("is_active", true)
    .order("name", { ascending: true });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, image_url, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-6 text-[11px] text-neutral-500">
        <a href="/" className="hover:text-neutral-200">
          Acasă
        </a>
        <span className="mx-1">/</span>
        <a href="/products" className="hover:text-neutral-200">
          Produse
        </a>
        <span className="mx-1">/</span>
        <span className="text-neutral-300">Categorie</span>
      </nav>

      {products && products.length > 0 ? (
        <ProductsListingClient products={products} categories={categories ?? []} />
      ) : (
        <p className="text-sm text-neutral-400">Nu sunt produse disponibile încă.</p>
      )}
    </div>
  );
}
