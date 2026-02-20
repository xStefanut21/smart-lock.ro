import React from 'react';

interface ProductStructuredData {
  id: string;
  name: string;
  description: string;
  image: string[];
  sku: string;
  brand: {
    name: string;
  };
  offers: {
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
    priceValidUntil?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
  review?: Array<{
    author: string;
    reviewRating: {
      ratingValue: number;
    };
    reviewBody: string;
  }>;
}

/**
 * JSON-LD Structured Data Component for Product Schema
 * Generates rich snippets for Google, Bing, and other search engines
 */
export function ProductStructuredData({ product }: { product: ProductStructuredData }) {
  // Ensure we have required fields
  if (!product.name || !product.offers?.price) {
    return null;
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: product.brand,
    offers: {
      '@type': 'Offer',
      price: product.offers.price,
      priceCurrency: product.offers.priceCurrency,
      availability: product.offers.availability,
      url: product.offers.url,
      ...(product.offers.priceValidUntil && {
        priceValidUntil: product.offers.priceValidUntil
      })
    },
    ...(product.aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.aggregateRating.ratingValue,
        reviewCount: product.aggregateRating.reviewCount
      }
    }),
    ...(product.review && product.review.length > 0 && {
      review: product.review.map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.reviewRating.ratingValue
        },
        reviewBody: review.reviewBody
      }))
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

/**
 * Utility function to get product structured data from database
 */
export async function getProductStructuredData(productSlug: string) {
  try {
    const { createSupabaseServerClient } = await import('@/lib/supabase/server');
    const supabase = createSupabaseServerClient();

    // Fetch product with reviews and ratings
    const { data: product } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        short_description,
        price,
        image_url,
        brand,
        stock,
        categories (name),
        product_images (image_url),
        reviews (
          id,
          rating,
          comment,
          created_at,
          profiles (full_name)
        )
      `)
      .eq('slug', productSlug)
      .eq('is_active', true)
      .single();

    if (!product) return null;

    // Calculate aggregate rating
    const reviews = product.reviews || [];
    const aggregateRating = reviews.length > 0 ? {
      ratingValue: reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length,
      reviewCount: reviews.length
    } : undefined;

    // Get all product images
    const images: string[] = [];
    if (product.image_url) images.push(product.image_url);
    if (product.product_images) {
      product.product_images.forEach((img: any) => {
        if (img.image_url && !images.includes(img.image_url)) {
          images.push(img.image_url);
        }
      });
    }

    // Determine availability
    const availability = product.stock && product.stock > 0
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock';

    const structuredData: ProductStructuredData = {
      id: product.id,
      name: product.name,
      description: product.description || product.short_description || product.name,
      image: images.length > 0 ? images : [],
      sku: product.id, // Using product ID as SKU
      brand: {
        name: product.brand || 'Smart Lock'
      },
      offers: {
        price: product.price,
        priceCurrency: 'RON',
        availability,
        url: `https://smart-lock.ro/products/${productSlug}`,
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
      },
      ...(aggregateRating && { aggregateRating }),
      ...(reviews.length > 0 && {
        review: reviews.slice(0, 5).map((review: any) => ({ // Limit to 5 reviews for performance
          author: review.profiles?.full_name || 'Client anonim',
          reviewRating: {
            ratingValue: review.rating
          },
          reviewBody: review.comment || ''
        }))
      })
    };

    return structuredData;
  } catch (error) {
    console.error('Error fetching product structured data:', error);
    return null;
  }
}
