import type { MetadataRoute } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://smart-lock.ro";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/cart",
    "/checkout",
    "/login",
    "/register",
    "/account",
    "/account/orders",
    "/account/profile",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const adminRoutes: MetadataRoute.Sitemap = [
    "/admin",
    "/admin/orders",
    "/admin/products",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.3,
  }));

  const supabase = createSupabaseServerClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("categories")
      .select("slug, updated_at, is_active")
      .eq("is_active", true),
    supabase
      .from("products")
      .select("slug, updated_at, is_active")
      .eq("is_active", true),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = (categories || [])
    .filter((c) => c.slug)
    .map((c: any) => ({
      url: `${baseUrl}/products/categories/${encodeURIComponent(c.slug)}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const productRoutes: MetadataRoute.Sitemap = (products || [])
    .filter((p) => p.slug)
    .map((p: any) => ({
      url: `${baseUrl}/products/${encodeURIComponent(p.slug)}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : now,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...adminRoutes];
}
