"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { HomeBannerSlider } from "@/components/home-banner-slider";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <HomeBannerSlider />
      <div className="mt-8 flex min-h-[calc(100vh-56px-120px)] flex-col justify-center gap-12 md:flex-row md:items-center">
      <section className="max-w-xl space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
          Yale smart pentru locuințe moderne
        </p>
        <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
          Magazin online dedicat yalelor smart pentru piața din România.
        </h1>
        <p className="text-sm text-neutral-300 md:text-base">
          Alege yale inteligente compatibile cu ușile din România, cu instalare
          simplă, acces de la distanță și integrare cu aplicații mobile. Stoc și
          prețuri actualizate în timp real.
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href="/products"
            className="rounded-full bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-500"
          >
            Vezi catalogul de yale smart
          </a>
          {isLoggedIn === false && (
            <a
              href="/login"
              className="rounded-full border border-neutral-700 px-5 py-2 text-neutral-200 hover:border-blue-500"
            >
              Intră în contul tău
            </a>
          )}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-xs text-neutral-300 md:text-sm">
          <div>
            <dt className="font-medium text-white">Livrare rapidă</dt>
            <dd>24-48h pentru produsele aflate în stoc, prin curieri naționali.</dd>
          </div>
          <div>
            <dt className="font-medium text-white">Instalare ușoară</dt>
            <dd>Compatibilitate cu majoritatea cilindrilor și ușilor de apartament.</dd>
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

      <section className="mt-6 w-full max-w-md rounded-2xl border border-neutral-900 bg-gradient-to-br from-neutral-950 via-neutral-900 to-blue-950/40 p-6 text-sm text-neutral-200 shadow-[0_0_60px_rgba(37,99,235,0.35)] md:mt-0">
        <h2 className="mb-3 text-base font-medium text-white">
          De ce smart-lock.ro?
        </h2>
        <ul className="space-y-2">
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Focus exclusiv pe yale smart, nu un magazin generalist.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Stoc, prețuri și specificații tehnice actualizate din baza de date.</span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>Arhitectură modernă: Next.js 14, Supabase, pregătită pentru scalare.</span>
          </li>
        </ul>
        <div className="mt-4 rounded-lg border border-neutral-800 bg-black/40 p-3 text-xs text-neutral-400">
          <p>
            Comenzile se achită momentan exclusiv ramburs la livrare, iar fluxul de
            comandă este complet funcțional. Poți explora catalogul, adăuga produse
            în coș și plasa comanda direct din site.
          </p>
        </div>
      </section>
      </div>
    </div>
  );
}
