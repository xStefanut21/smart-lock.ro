"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SEOSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  og_image: string | null;
  favicon_url: string | null;
  google_analytics_id: string | null;
  google_search_console_id: string | null;
  facebook_pixel_id: string | null;
  robots_txt: string;
  sitemap_enabled: boolean;
  json_ld_enabled: boolean;
  open_graph_enabled: boolean;
  twitter_cards_enabled: boolean;
}

export default function AdminSEOPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SEOSettings>({
    site_title: "",
    site_description: "",
    site_keywords: "",
    og_image: null,
    favicon_url: null,
    google_analytics_id: null,
    google_search_console_id: null,
    facebook_pixel_id: null,
    robots_txt: `User-agent: *
Allow: /

# Sitemap
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://smart-lock.ro'}/sitemap.xml

# Block common non-content paths
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/`,
    sitemap_enabled: true,
    json_ld_enabled: true,
    open_graph_enabled: true,
    twitter_cards_enabled: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/admin/login");
          return;
        }

        // Load existing SEO settings
        await loadSEOSettings();
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadSEOSettings = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading SEO settings:", error);
        return;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error loading SEO settings:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      
      const { error } = await supabase
        .from("seo_settings")
        .upsert(settings);

      if (error) {
        console.error("Error saving SEO settings:", error);
        alert("Eroare la salvarea setărilor SEO");
        return;
      }

      alert("Setările SEO au fost salvate cu succes!");
    } catch (error) {
      console.error("Error saving SEO settings:", error);
      alert("Eroare la salvarea setărilor SEO");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'og_image' | 'favicon') => {
    try {
      const supabase = createSupabaseBrowserClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `seo/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("seo-assets")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("Nu am putut încărca imaginea");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("seo-assets").getPublicUrl(filePath);

      setSettings(prev => ({
        ...prev,
        [type]: publicUrl
      }));

    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Eroare la încărcarea imaginii");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="text-white">Se încarcă...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">SEO Settings</h1>
          <p className="text-neutral-400">
            Configurează setările SEO pentru optimizarea motoarelor de căutare și social media
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic SEO Settings */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Setări SEO de bază</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-neutral-300" htmlFor="site_title">
                  Titlu site
                </label>
                <input
                  id="site_title"
                  type="text"
                  value={settings.site_title}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_title: e.target.value }))}
                  className="h-9 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-neutral-100 outline-none focus:border-red-500"
                  placeholder="Smart Lock - Sisteme de Securitate"
                />
                <p className="text-[11px] text-neutral-500">
                  Titlul principal al site-ului (max 60 caractere recomandat)
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-neutral-300" htmlFor="site_description">
                  Descriere site
                </label>
                <textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
                  rows={3}
                  className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-red-500"
                  placeholder="Descrierea site-ului pentru motoarele de căutare (max 160 caractere recomandat)"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-neutral-300" htmlFor="site_keywords">
                  Cuvinte cheie
                </label>
                <input
                  id="site_keywords"
                  type="text"
                  value={settings.site_keywords}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_keywords: e.target.value }))}
                  className="h-9 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-neutral-100 outline-none focus:border-red-500"
                  placeholder="smart lock, sisteme securitate, yale, incuierci, acces control"
                />
                <p className="text-[11px] text-neutral-500">
                  Separate prin virgulă
                </p>
              </div>
            </div>
          </div>

          {/* Social Media & Images */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Social Media & Imagini</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-neutral-300">OG Image (1200x630px)</label>
                <div className="flex items-center gap-4">
                  {settings.og_image && (
                    <img
                      src={settings.og_image}
                      alt="OG Image Preview"
                      className="h-16 w-28 rounded border border-neutral-700 object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'og_image');
                    }}
                    className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 file:mr-4 file:rounded file:border-0 file:bg-red-600 file:px-4 file:py-1 file:text-white file:cursor-pointer hover:file:bg-red-700"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Imaginea afișată când site-ul este distribuit pe social media
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-neutral-300">Favicon (32x32px)</label>
                <div className="flex items-center gap-4">
                  {settings.favicon_url && (
                    <img
                      src={settings.favicon_url}
                      alt="Favicon Preview"
                      className="h-8 w-8 rounded border border-neutral-700 object-cover"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'favicon');
                    }}
                    className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 file:mr-4 file:rounded file:border-0 file:bg-red-600 file:px-4 file:py-1 file:text-white file:cursor-pointer hover:file:bg-red-700"
                  />
                </div>
                <p className="text-[11px] text-neutral-500">
                  Iconița afișată în browser tab
                </p>
              </div>
            </div>
          </div>

          {/* Analytics & Tracking */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Analytics & Tracking</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-neutral-300" htmlFor="google_analytics_id">
                  Google Analytics ID
                </label>
                <input
                  id="google_analytics_id"
                  type="text"
                  value={settings.google_analytics_id || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, google_analytics_id: e.target.value || null }))}
                  className="h-9 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-neutral-100 outline-none focus:border-red-500"
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-[11px] text-neutral-500">
                  ID-ul pentru Google Analytics 4
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-neutral-300" htmlFor="google_search_console_id">
                  Google Search Console Verification
                </label>
                <input
                  id="google_search_console_id"
                  type="text"
                  value={settings.google_search_console_id || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, google_search_console_id: e.target.value || null }))}
                  className="h-9 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-neutral-100 outline-none focus:border-red-500"
                  placeholder="Meta tag content"
                />
                <p className="text-[11px] text-neutral-500">
                  Codul de verificare pentru Google Search Console
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-neutral-300" htmlFor="facebook_pixel_id">
                  Facebook Pixel ID
                </label>
                <input
                  id="facebook_pixel_id"
                  type="text"
                  value={settings.facebook_pixel_id || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, facebook_pixel_id: e.target.value || null }))}
                  className="h-9 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-neutral-100 outline-none focus:border-red-500"
                  placeholder="XXXXXXXXXXXXXXXX"
                />
                <p className="text-[11px] text-neutral-500">
                  ID-ul pentru Facebook Pixel tracking
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Setări Avansate</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sitemap_enabled"
                  checked={settings.sitemap_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, sitemap_enabled: e.target.checked }))}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-red-600 focus:ring-red-600"
                />
                <label htmlFor="sitemap_enabled" className="text-neutral-300">
                  Activează Sitemap XML
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="json_ld_enabled"
                  checked={settings.json_ld_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, json_ld_enabled: e.target.checked }))}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-red-600 focus:ring-red-600"
                />
                <label htmlFor="json_ld_enabled" className="text-neutral-300">
                  Activează JSON-LD Structured Data
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="open_graph_enabled"
                  checked={settings.open_graph_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, open_graph_enabled: e.target.checked }))}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-red-600 focus:ring-red-600"
                />
                <label htmlFor="open_graph_enabled" className="text-neutral-300">
                  Activează Open Graph Tags
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="twitter_cards_enabled"
                  checked={settings.twitter_cards_enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, twitter_cards_enabled: e.target.checked }))}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-red-600 focus:ring-red-600"
                />
                <label htmlFor="twitter_cards_enabled" className="text-neutral-300">
                  Activează Twitter Cards
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-neutral-300" htmlFor="robots_txt">
                  robots.txt
                </label>
                <textarea
                  id="robots_txt"
                  value={settings.robots_txt}
                  onChange={(e) => setSettings(prev => ({ ...prev, robots_txt: e.target.value }))}
                  rows={8}
                  className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100 outline-none focus:border-red-500 font-mono text-sm"
                />
                <p className="text-[11px] text-neutral-500">
                  Fișierul robots.txt pentru crawler-e motoarelor de căutare
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Se salvează..." : "Salvează Setările SEO"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
