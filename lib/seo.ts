import type { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface ProductSEO {
  id: string;
  name: string;
  price: number;
  slug: string;
  short_description: string | null;
  image_url: string | null;
  brand: string | null;
  stock: number | null;
  is_active: boolean;
  category_name?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
}

export interface SEOSettings {
  store_name: string;
  default_title_template: string;
  default_description_template: string;
  default_keywords_template: string;
}

/**
 * Get SEO settings from database or use defaults
 */
export async function getSEOSettings(): Promise<SEOSettings> {
  try {
    const supabase = createSupabaseServerClient();

    const { data } = await supabase
      .from('seo_settings')
      .select('*')
      .single();

    if (data) {
      return {
        store_name: data.store_name || 'Smart Lock',
        default_title_template: data.default_title_template || 'Cumpără [product_name] la doar [price] RON în categoria [category] - [store_name]',
        default_description_template: data.default_description_template || 'Descoperă [product_name] de la [brand] la prețul de [price] RON. [short_description] Livrare rapidă în toată România.',
        default_keywords_template: data.default_keywords_template || '[product_name], [brand], [category], cumpărare online, [store_name]'
      };
    }
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
  }

  // Return defaults
  return {
    store_name: 'Smart Lock',
    default_title_template: 'Cumpără [product_name] la doar [price] RON în categoria [category] - [store_name]',
    default_description_template: 'Descoperă [product_name] de la [brand] la prețul de [price] RON. [short_description] Livrare rapidă în toată România.',
    default_keywords_template: '[product_name], [brand], [category], cumpărare online, [store_name]'
  };
}

/**
 * Replace template variables in a string
 */
export function replaceTemplateVariables(
  template: string,
  product: ProductSEO,
  settings: SEOSettings
): string {
  return template
    .replace(/\[product_name\]/g, product.name || '')
    .replace(/\[price\]/g, product.price ? `${product.price}` : '')
    .replace(/\[category\]/g, product.category_name || '')
    .replace(/\[brand\]/g, product.brand || '')
    .replace(/\[store_name\]/g, settings.store_name)
    .replace(/\[short_description\]/g, product.short_description || '')
    .replace(/\[slug\]/g, product.slug || '')
    .trim();
}

/**
 * Optimize title for Google snippet score (under 60 characters)
 */
export function optimizeTitle(title: string): string {
  if (title.length <= 60) return title;
  return title.substring(0, 57) + '...';
}

/**
 * Optimize meta description for Google snippet score (under 160 characters)
 */
export function optimizeDescription(description: string): string {
  if (description.length <= 160) return description;
  return description.substring(0, 157) + '...';
}

/**
 * Generate metadata for a product page with fallbacks
 */
export async function generateProductMetadata(
  productSlug: string,
  customOverrides?: Partial<Pick<ProductSEO, 'meta_title' | 'meta_description' | 'meta_keywords'>>
): Promise<Metadata> {
  try {
    const supabase = createSupabaseServerClient();
    const settings = await getSEOSettings();

    // Fetch product with category
    const { data: product } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        slug,
        short_description,
        image_url,
        brand,
        stock,
        is_active,
        meta_title,
        meta_description,
        meta_keywords,
        categories (
          name
        )
      `)
      .eq('slug', productSlug)
      .eq('is_active', true)
      .single();

    if (!product) {
      return {
        title: `Produs negăsit - ${settings.store_name}`,
        description: `Produsul căutat nu a fost găsit în catalogul ${settings.store_name}.`,
      };
    }

    const productWithCategory: ProductSEO = {
      ...product,
      category_name: (product.categories as any)?.name || null,
    };

    // Use custom overrides if provided, otherwise use database values or templates
    const title = customOverrides?.meta_title ||
                  productWithCategory.meta_title ||
                  replaceTemplateVariables(settings.default_title_template, productWithCategory, settings);

    const description = customOverrides?.meta_description ||
                       productWithCategory.meta_description ||
                       replaceTemplateVariables(settings.default_description_template, productWithCategory, settings);

    const keywords = customOverrides?.meta_keywords ||
                     productWithCategory.meta_keywords ||
                     replaceTemplateVariables(settings.default_keywords_template, productWithCategory, settings);

    // Optimize for Google snippet scores
    const optimizedTitle = optimizeTitle(title);
    const optimizedDescription = optimizeDescription(description);

    const baseUrl = 'https://smart-lock.ro';
    const canonicalUrl = `${baseUrl}/products/${productWithCategory.slug}`;

    // Build metadata object
    const metadata: Metadata = {
      title: optimizedTitle,
      description: optimizedDescription,
      keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
      authors: [{ name: settings.store_name }],
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: optimizedTitle,
        description: optimizedDescription,
        url: canonicalUrl,
        siteName: settings.store_name,
        type: 'website',
        images: productWithCategory.image_url ? [
          {
            url: productWithCategory.image_url,
            width: 1200,
            height: 630,
            alt: productWithCategory.name,
          }
        ] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: optimizedTitle,
        description: optimizedDescription,
        images: productWithCategory.image_url ? [productWithCategory.image_url] : [],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };

    return metadata;
  } catch (error) {
    console.error('Error generating product metadata:', error);

    // Return basic metadata on error
    const settings = await getSEOSettings();
    return {
      title: `Produs - ${settings.store_name}`,
      description: `Descoperă produse de calitate la ${settings.store_name}. Livrare rapidă în toată România.`,
    };
  }
}
