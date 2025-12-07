"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AdminBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function AdminBannersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/admin/banners");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile || profile.is_admin !== true) {
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("home_banners")
        .select(
          "id, title, subtitle, image_url, link_url, sort_order, is_active"
        )
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        setError("Nu am putut încărca bannerele. Încearcă din nou.");
        setLoading(false);
        return;
      }

      setBanners(data ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă lista de bannere...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-200">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-xs text-neutral-400 hover:text-white"
      >
        ← Înapoi
      </button>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Bannere homepage</h1>
          <p className="text-xs text-neutral-400">
            Administrează imaginile afișate în sliderul de pe pagina principală.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/banners/new")}
          className="self-start rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-500"
        >
          + Adaugă banner nou
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {banners.length === 0 ? (
        <p className="text-xs text-neutral-400">
          Nu există încă bannere. Folosește butonul „Adaugă banner nou” pentru a crea
          primul banner.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/60">
          <table className="min-w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-neutral-800 bg-neutral-950/80 text-neutral-400">
              <tr>
                <th className="px-3 py-2">Previzualizare</th>
                <th className="px-3 py-2">Titlu</th>
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2">Ordine</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr
                  key={banner.id}
                  className="cursor-pointer border-t border-neutral-900/80 hover:bg-neutral-900/60"
                  onClick={() => router.push(`/admin/banners/${banner.id}`)}
                >
                  <td className="px-3 py-2 align-top">
                    <div className="flex h-12 w-32 items-center justify-center overflow-hidden rounded border border-neutral-800 bg-neutral-900">
                      <img
                        src={banner.image_url}
                        alt={banner.title || "Banner"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top text-[11px] text-neutral-200">
                    {banner.title || "(fără titlu)"}
                    {banner.subtitle && (
                      <div className="mt-0.5 max-w-xs truncate text-[10px] text-neutral-400">
                        {banner.subtitle}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 align-top text-[11px] text-neutral-400">
                    {banner.link_url || "-"}
                  </td>
                  <td className="px-3 py-2 align-top text-[11px] text-neutral-300">
                    {banner.sort_order}
                  </td>
                  <td className="px-3 py-2 align-top text-[11px]">
                    {banner.is_active ? (
                      <span className="rounded bg-green-900/40 px-2 py-0.5 text-[10px] text-green-300">
                        Activ
                      </span>
                    ) : (
                      <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                        Dezactivat
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
