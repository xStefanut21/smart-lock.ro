import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, price, short_description, description, specs, image_url, stock, is_active, slug"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!product || product.is_active === false) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <a href="/products" className="text-sm text-blue-500 hover:underline">
        &larr; Înapoi la catalog
      </a>
      <div className="mt-4 flex flex-col gap-6 md:flex-row">
        {product.image_url && (
          <div className="w-full max-w-xs flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-lg border border-neutral-800 object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-semibold">{product.name}</h1>
            <WishlistToggleButton
              productId={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.image_url ?? null}
              slug={product.slug}
            />
          </div>
          <p className="mt-2 text-lg font-semibold text-blue-500">
            {new Intl.NumberFormat("ro-RO", {
              style: "currency",
              currency: "RON",
            }).format(product.price)}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            {typeof product.stock === "number" && product.stock > 0
              ? `În stoc (${product.stock} buc.)`
              : "Stoc epuizat"}
          </p>
          <div className="mt-3 max-w-xs">
        <AddToCartButton
          productId={product.id}
          name={product.name}
          price={product.price}
          disabled={!(typeof product.stock === "number" && product.stock > 0)}
        />
          </div>
        </div>
      </div>
      {product.short_description && (
        <p className="mt-4 text-neutral-200">{product.short_description}</p>
      )}
      {product.description && (
        <div className="mt-6 rounded-lg bg-neutral-900 p-4 text-neutral-100">
          <h2 className="mb-2 text-lg font-medium">Descriere</h2>
          <p className="whitespace-pre-line break-words text-sm leading-relaxed">
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
