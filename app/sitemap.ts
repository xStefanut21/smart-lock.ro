import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://smart-lock.ro";
  const now = new Date();

  // Static pages with optimized SEO priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.1,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cum-cumperi`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cum-platesc`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/detalii-livrare`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/politica-de-retur`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/termeni-si-conditii`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/confidentialitate`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/anpc`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const supabase = createSupabaseServerClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("slug, updated_at, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select(`
        slug,
        updated_at,
        is_active,
        price,
        stock,
        categories (
          slug,
          sort_order
        )
      `)
      .eq("is_active", true)
      .order("updated_at", { ascending: false }),
  ]);

  // Category pages with SEO-optimized priorities
  const categoryRoutes: MetadataRoute.Sitemap = (categories || [])
    .filter((c) => c.slug)
    .map((c: any) => ({
      url: `${baseUrl}/products/categories/${encodeURIComponent(c.slug)}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: "weekly" as const,
      priority: Math.max(0.4, Math.min(0.8, 0.8 - (c.sort_order || 0) * 0.1)), // Higher priority for top categories
    }));

  // Product pages with dynamic priorities based on price, stock, and recency
  const productRoutes: MetadataRoute.Sitemap = (products || [])
    .filter((p) => p.slug)
    .map((p: any) => {
      // Calculate priority based on multiple factors
      let priority = 0.5; // Base priority

      // Higher priority for products with stock
      if (p.stock && p.stock > 0) {
        priority += 0.1;
      }

      // Higher priority for lower-priced products (more accessible)
      if (p.price && p.price < 500) {
        priority += 0.1;
      }

      // Higher priority for recently updated products
      const daysSinceUpdate = p.updated_at
        ? Math.floor((now.getTime() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24))
        : 30;

      if (daysSinceUpdate < 7) {
        priority += 0.2; // Recently updated
      } else if (daysSinceUpdate < 30) {
        priority += 0.1; // Updated this month
      }

      // Clamp priority between 0.3 and 0.9
      priority = Math.max(0.3, Math.min(0.9, priority));

      return {
        url: `${baseUrl}/products/${encodeURIComponent(p.slug)}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: daysSinceUpdate < 7 ? "daily" : "weekly" as const,
        priority,
      };
    });

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes
  ].sort((a, b) => (b.priority || 0) - (a.priority || 0)); // Sort by priority for better SEO
}
