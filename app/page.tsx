"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { HomeBannerSlider } from "@/components/home-banner-slider";

type HomeCategory = {
  id: string;
  name: string | null;
  slug: string | null;
  image_url: string | null;
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<HomeCategory[]>([]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function loadCategories() {
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug, image_url, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (data && Array.isArray(data)) {
        setCategories(
          data.map((row: any) => ({
            id: row.id,
            name: row.name ?? null,
            slug: row.slug ?? null,
            image_url: row.image_url ?? null,
          }))
        );
      }
    }

    loadCategories();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HomeBannerSlider />
      {categories.length > 0 && (
        <section className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={cat.slug ? `/products/categories/${encodeURIComponent(cat.slug)}` : "/products"}
                className="flex flex-col items-center rounded-md border border-neutral-800 bg-neutral-950/80 px-3 py-3 text-center text-xs transition hover:border-blue-500 hover:bg-neutral-900"
              >
                <div className="mb-2 flex h-24 w-full items-center justify-center overflow-hidden rounded bg-white">
                  {cat.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image_url}
                      alt={cat.name ?? "Categorie"}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-[11px] text-neutral-500">Fără imagine</span>
                  )}
                </div>
                <span className="text-sm font-semibold text-blue-400">
                  {cat.name ?? "Categorie"}
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
      <div className="mt-10 flex flex-col items-stretch gap-10 rounded-3xl border border-neutral-900 bg-gradient-to-br from-neutral-950 via-neutral-950 to-slate-950/60 px-6 py-8 shadow-[0_0_80px_rgba(15,23,42,0.7)] md:mt-12 md:flex-row md:items-center md:px-10 md:py-10">
        <section className="max-w-xl space-y-5">
          <span className="inline-flex items-center rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-blue-300">
            Yale smart pentru locuințe moderne
          </span>
          <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
            Magazin online dedicat yalelor smart pentru piața din România.
          </h1>
          <p className="text-sm text-neutral-300 md:text-base">
            Alege yale inteligente compatibile cu ușile din România, cu instalare simplă,
            acces de la distanță și integrare cu aplicații mobile. Stoc și prețuri
            actualizate în timp real.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href="/products"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 font-medium text-white shadow-sm shadow-blue-600/40 hover:bg-blue-500"
            >
              Vezi catalogul de yale smart
            </a>
            {isLoggedIn === false && (
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-5 py-2 text-neutral-200 hover:border-blue-500"
              >
                Intră în contul tău
              </a>
            )}
          </div>
          <dl className="mt-5 grid gap-4 text-xs text-neutral-300 md:grid-cols-2 md:text-sm">
            <div>
              <dt className="font-medium text-white">Livrare rapidă</dt>
              <dd>24-48h pentru produsele aflate în stoc, prin curieri naționali.</dd>
            </div>
            <div>
              <dt className="font-medium text-white">Instalare ușoară</dt>
              <dd>Compatibilă cu majoritatea cilindrilor și ușilor de apartament.</dd>
            </div>
            <div>
              <dt className="font-medium text-white">Plată la livrare</dt>
              <dd>Toate comenzile se achită simplu, ramburs, direct la curier.</dd>
            </div>
            <div>
              <dt className="font-medium text-white">Suport local</dt>
              <dd>Asistență tehnică în limba română, pe email și telefon.</dd>
            </div>
          </dl>
        </section>

        <section className="w-full max-w-md rounded-2xl border border-neutral-800 bg-gradient-to-br from-slate-950 via-neutral-950 to-blue-950/50 p-6 text-sm text-neutral-200 shadow-[0_0_60px_rgba(37,99,235,0.45)]">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
            De ce smart-lock.ro?
          </p>
          <h2 className="mb-4 text-base font-medium text-white">
            Tot ce ai nevoie pentru acces smart, în același loc.
          </h2>
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              <span>
                Gamă dedicată de yale și accesorii smart, potrivite pentru uși de apartament și case.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              <span>
                Consultanță înainte de achiziție și recomandări pentru alegerea modelului potrivit.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              <span>
                Posibilitate de montaj prin parteneri, garanție și suport post-instalăre în limba română.
              </span>
            </li>
          </ul>
          <div className="mt-5 rounded-lg border border-neutral-800 bg-black/40 p-3 text-xs text-neutral-400">
            <p>
              Comanda se plasează simplu, online, iar plata se face ramburs la livrare.
              După confirmare, pregătim rapid coletul și îl trimitem prin curier, astfel
              încât să te bucuri cât mai repede de produsele tale.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
