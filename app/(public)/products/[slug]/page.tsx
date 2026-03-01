import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { ProductAddToCartWithInstallation } from "@/components/product-add-to-cart-with-installation";
import { ProductColorAddToCart } from "@/components/product-color-add-to-cart";
import { ProductOptionsAddToCart } from "@/components/product-options-add-to-cart";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
import { ProductImageGallery } from "@/components/product-image-gallery";
import { ProductDescriptionReviewsTabs } from "@/components/product-description-reviews-tabs";
import { MarkdownRenderer } from "@/components/markdown-renderer";

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
    .select("name, meta_title, meta_description, meta_keywords, image_url, image_alt, image_title")
    .eq("slug", slug)
    .maybeSingle<{ 
      name: string | null;
      meta_title: string | null;
      meta_description: string | null;
      meta_keywords: string | null;
      image_url: string | null;
      image_alt: string | null;
      image_title: string | null;
    }>();

  const title = product?.meta_title || product?.name || "Produs";
  const description = product?.meta_description || `Descoperă ${product?.name || 'acest produs'} la prețul cel mai bun. Livrare rapidă în toată România.`;
  const keywords = product?.meta_keywords;

  return {
    title,
    description,
    keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
    openGraph: {
      title,
      description,
      images: product?.image_url ? [{ url: product.image_url, alt: product.image_alt || product.name || undefined }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = createSupabaseServerClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, price, short_description, description, specs, image_url, stock, is_active, slug, color_options, has_installation_option, installation_price, meta_title, meta_description, meta_keywords, seo_h1, seo_h2, seo_h3, image_alt, image_title, etichete_produs, product_images(image_url, sort_order), product_manuals(id, title, pdf_url, created_at), product_options!left(id, required, price_modifier, default_value_id, options!left(id, name))"
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

  const productUrl = `https://smart-lock.ro/products/${encodeURIComponent(product.slug)}`;
  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: galleryImages,
    description: product.short_description || product.description || undefined,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'RON',
      price: product.price,
      availability:
        typeof product.stock === 'number' && product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData) }}
      />
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
            <ProductImageGallery 
              images={galleryImages} 
              alt={product.image_alt || product.name}
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold md:text-3xl">
              {product.seo_h1 || product.name}
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
            {Array.isArray(product.product_manuals) && product.product_manuals.length > 0 && (
              <div className="mt-3 rounded-md border border-neutral-800 bg-neutral-950/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
                  Manuale PDF
                </p>
                <ul className="space-y-2">
                  {product.product_manuals.map((m: any) => (
                    <li key={m.id} className="flex items-center justify-between gap-3">
                      <span className="truncate text-[12px] text-neutral-200">
                        {m.title || "Manual"}
                      </span>
                      <a
                        href={m.pdf_url}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-[11px] font-medium text-neutral-100 hover:bg-neutral-800"
                      >
                        Descarcă
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 max-w-xs">
              <ProductAddToCartWithInstallation
                productId={product.id}
                name={product.name}
                price={product.price}
                imageUrl={product.image_url ?? null}
                stockAvailable={typeof product.stock === "number" && product.stock > 0}
                hasInstallationOption={product.has_installation_option === true}
                installationPrice={product.installation_price}
                productOptions={
                  product.product_options && Array.isArray(product.product_options) && product.product_options.length > 0
                    ? (() => {
                        const options = product.product_options.map((po: any) => ({
                          optionId: po.options?.id || '',
                          optionName: po.options?.name || '',
                          required: po.required || false,
                          priceModifier: po.price_modifier || 0,
                          defaultValueId: po.default_value_id || undefined,
                          values: [] // Will be loaded by client component
                        }));
                        return options;
                      })()
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Custom SEO Content Sections */}
      {(product.seo_h2 || product.seo_h3) && (
        <div className="mt-8 space-y-6">
          {product.seo_h2 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">
                {product.seo_h2}
              </h2>
              {product.seo_h3 && (
                <h3 className="text-lg font-medium text-neutral-200 mb-2">
                  {product.seo_h3}
                </h3>
              )}
            </section>
          )}
        </div>
      )}

      <ProductDescriptionReviewsTabs
        productId={product.id}
        slug={product.slug}
        description={product.description}
      />
    </div>
  );
}
