import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductSimpleAddToCartWithQuantity } from "@/components/product-simple-add-to-cart-with-quantity";
import { ProductColorAddToCart } from "@/components/product-color-add-to-cart";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { ProductDescriptionReviewsTabs } from "@/components/product-description-reviews-tabs";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: ProductPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select("name")
    .eq("slug", slug)
    .maybeSingle<{ name: string | null }>();

  return {
    title: product?.name || "Produs",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, price, short_description, description, specs, image_url, stock, is_active, slug, color_options, product_images(image_url, sort_order)"
    )
    .eq("slug", slug)
    .maybeSingle<any>();

  if (!product || product.is_active === false) {
    notFound();
  }

  const galleryImages: string[] = [];

  if (product.product_images && Array.isArray(product.product_images)) {
    const sorted = [...product.product_images].sort((a, b) => {
      const sa = typeof a.sort_order === "number" ? a.sort_order : 0;
      const sb = typeof b.sort_order === "number" ? b.sort_order : 0;
      return sa - sb;
    });
    for (const img of sorted) {
      if (img.image_url) {
        galleryImages.push(img.image_url as string);
      }
    }
  }

  if (!galleryImages.length && product.image_url) {
    galleryImages.push(product.image_url as string);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <a href="/products" className="text-sm text-blue-500 hover:underline">
        &larr; Înapoi la catalog
      </a>
      <nav className="mt-2 text-[11px] text-neutral-500">
        <a href="/" className="hover:text-neutral-200">
          Acasă
        </a>
        <span className="mx-1">/</span>
        <a href="/products" className="hover:text-neutral-200">
          Produse
        </a>
        <span className="mx-1">/</span>
        <span className="text-neutral-300">{product.name}</span>
      </nav>
      <div className="mt-4 flex flex-col gap-8 md:flex-row">
        {galleryImages.length > 0 && (
          <div className="md:w-1/2">
            <ProductImageGallery images={galleryImages} alt={product.name} />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold md:text-3xl">
              {product.name}
            </h1>
            <WishlistToggleButton
              productId={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.image_url ?? null}
              slug={product.slug}
            />
          </div>
          {product.short_description && (
            <p className="mt-2 text-sm text-neutral-300">
              {product.short_description}
            </p>
          )}
          <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-200">
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  {typeof product.stock === "number" && product.stock > 0
                    ? "În stoc"
                    : "Stoc epuizat"}
                </p>
                {typeof product.stock === "number" && product.stock > 0 && (
                  <p className="text-[11px] text-neutral-400">
                    ({product.stock} bucăți disponibile)
                  </p>
                )}
              </div>
              <p className="text-2xl font-semibold text-blue-400">
                {new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(product.price)}
              </p>
            </div>
            <div className="mt-4 max-w-xs">
              {typeof product.color_options === "string" && product.color_options.trim() ? (
                <ProductColorAddToCart
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.image_url ?? null}
                  stockAvailable={typeof product.stock === "number" && product.stock > 0}
                  colors={product.color_options
                    .split(",")
                    .map((c: string) => c.trim())
                    .filter((c: string) => c.length > 0)}
                />
              ) : (
                <ProductSimpleAddToCartWithQuantity
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.image_url ?? null}
                  disabled={!(typeof product.stock === "number" && product.stock > 0)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ProductDescriptionReviewsTabs
        productId={product.id}
        slug={product.slug}
        description={product.description}
      />
    </div>
  );
}
