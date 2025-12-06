import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/add-to-cart-button";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name, price, short_description, description, specs")
    .eq("slug", slug)
    .single();

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <a href="/products" className="text-sm text-blue-500 hover:underline">
        &larr; Înapoi la catalog
      </a>
      <h1 className="mt-4 text-3xl font-semibold">{product.name}</h1>
      <p className="mt-2 text-lg font-semibold text-blue-600">
        {new Intl.NumberFormat("ro-RO", {
          style: "currency",
          currency: "RON",
        }).format(product.price / 100)}
      </p>
      <div className="mt-3 max-w-xs">
        <AddToCartButton
          productId={product.id}
          name={product.name}
          price={product.price}
        />
      </div>
      {product.short_description && (
        <p className="mt-4 text-neutral-200">{product.short_description}</p>
      )}
      {product.description && (
        <div className="mt-6 rounded-lg bg-neutral-900 p-4 text-neutral-100">
          <h2 className="mb-2 text-lg font-medium">Descriere</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {product.description}
          </p>
        </div>
      )}
      {product.specs && (
        <div className="mt-6 rounded-lg bg-neutral-900 p-4 text-neutral-100">
          <h2 className="mb-2 text-lg font-medium">Specificații tehnice</h2>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(product.specs, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
