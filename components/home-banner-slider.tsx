"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
}

export function HomeBannerSlider() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const { data } = await supabase
        .from("home_banners")
        .select("id, title, subtitle, image_url, link_url, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setBanners(
          data.map((b: any) => ({
            id: b.id,
            title: b.title,
            subtitle: b.subtitle,
            image_url: b.image_url,
            link_url: b.link_url,
          }))
        );
      }

      setLoading(false);
    }

    load();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  if (!loading && banners.length === 0) return null;

  function handleClick(banner: Banner) {
    if (banner.link_url) {
      if (banner.link_url.startsWith("http")) {
        window.location.href = banner.link_url;
      } else {
        router.push(banner.link_url);
      }
    }
  }

  return (
    <section className="mx-auto mt-4 max-w-6xl px-4">
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/80">
        {loading || banners.length === 0 ? (
          <div className="aspect-[16/5] w-full animate-pulse bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900" />
        ) : (
          <>
            {(() => {
              const active = banners[current];
              return (
                <>
                  <button
                    type="button"
                    onClick={() => handleClick(active)}
                    className="block w-full cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={active.image_url}
                      alt={active.title || "Banner"}
                      className="h-auto w-full object-cover"
                    />
                  </button>
                  {(active.title || active.subtitle) && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
                      <div className="rounded-full bg-black/60 px-4 py-1.5 text-center text-[11px] text-neutral-100 shadow-lg">
                        {active.title && (
                          <div className="font-semibold text-white">{active.title}</div>
                        )}
                        {active.subtitle && (
                          <div className="text-[10px] text-neutral-300">{active.subtitle}</div>
                          )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setCurrent(index)}
                  className={`h-1.5 w-4 rounded-full border border-neutral-500 transition-colors ${
                    index === current ? "bg-white" : "bg-neutral-800"
                  }`}
                  aria-label={`Vezi bannerul ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
