"use client";

import { usePathname } from "next/navigation";
import { HomeRecommendedProductsSlider } from "@/components/home-recommended-products-slider";

export function SiteFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer className="mt-12 border-t border-neutral-900 bg-black text-[13px] text-neutral-200">
      {isHome && (
        <section className="border-b border-neutral-900 bg-neutral-950/70">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm">
            <HomeRecommendedProductsSlider />
            <h2 className="mb-2 mt-4 text-base font-semibold uppercase tracking-wide text-white">
              Oferim consultanță și montaj pentru toate produsele comercializate
            </h2>
            <p className="mb-1 text-neutral-300">
              Asigurăm garanție și post-garanție pentru yale smart instalate de echipe
              partenere, precum și suport în alegerea soluției potrivite pentru tipul tău de ușă.
            </p>
            <p className="mb-4 text-neutral-400">
              Răspundem rapid solicitărilor legate de montaj, integrare în aplicații mobile
              și configurare acces.
            </p>
            <p className="flex items-center gap-2 text-neutral-200">
              <span className="text-lg">☎</span>
              <span>
                Consultanță telefonică: <span className="font-medium">0741 119 449</span>
              </span>
            </p>

            <div className="mt-6 grid gap-4 text-xs text-neutral-300 md:grid-cols-4">
              <div className="flex items-start gap-2">
                <span className="text-lg">🚚</span>
                <div>
                  <p className="font-semibold text-white">Transport rapid</p>
                  <p>Livrare în 24-48h pentru produsele aflate în stoc.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">💬</span>
                <div>
                  <p className="font-semibold text-white">Suport online</p>
                  <p>Asistență tehnică în limba română, pe email și telefon.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">↺</span>
                <div>
                  <p className="font-semibold text-white">Retur &amp; înlocuire</p>
                  <p>Politică de retur conform legislației în vigoare.</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg">💳</span>
                <div>
                  <p className="font-semibold text-white">Plată la livrare</p>
                  <p>Toate comenzile se achită simplu, ramburs, direct la curier.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Secțiune social media + abonare + coloane info: vizibilă peste tot */}
      <section className="border-b border-neutral-900 bg-neutral-950/70">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-4 text-xs text-neutral-400">
          <div className="flex flex-col items-start justify-between gap-4 border-t border-neutral-900 pt-4 md:flex-row md:items-center">
            <p>Ne găsești și pe social media: Instagram, Facebook, YouTube.</p>
            <div className="flex w-full max-w-md gap-2">
              <input
                type="email"
                placeholder="Adresa ta de email"
                className="h-9 flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 text-xs text-neutral-100 outline-none focus:border-blue-500"
              />
              <button className="h-9 rounded-md bg-red-600 px-4 text-xs font-medium text-white hover:bg-red-500">
                Abonare
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3 text-sm">
            <p className="text-lg font-semibold tracking-tight text-white">smart-lock.ro</p>
            <ul className="space-y-1 text-neutral-300">
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>0741 119 449</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <span>contact@smart-lock.ro</span>
              </li>
              <li className="flex items-center gap-2">
                <span>⏰</span>
                <span>Luni - Vineri: 9:00 - 17:00</span>
              </li>
            </ul>
          </div>

          <div className="grid flex-1 gap-8 md:grid-cols-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Info
              </p>
              <ul className="space-y-1 text-neutral-300">
                <li>
                  <a href="/politica-de-retur" className="hover:text-white">
                    Politica de retur
                  </a>
                </li>
                <li>
                  <a href="/detalii-livrare" className="hover:text-white">
                    Detalii livrare
                  </a>
                </li>
                <li>
                  <a href="/confidentialitate" className="hover:text-white">
                    Confidențialitate
                  </a>
                </li>
                <li>
                  <a href="/termeni-si-conditii" className="hover:text-white">
                    Termeni și condiții
                  </a>
                </li>
                <li>
                  <a href="/anpc" className="hover:text-white">
                    ANPC
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Contul meu
              </p>
              <ul className="space-y-1 text-neutral-300">
                <li>
                  <a href="/account" className="hover:text-white">
                    Contul meu
                  </a>
                </li>
                <li>
                  <a href="/account/orders" className="hover:text-white">
                    Istoric comenzi
                  </a>
                </li>
                <li>
                  <a href="/account/wishlist" className="hover:text-white">
                    Wish list
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Link-uri utile
              </p>
              <ul className="space-y-1 text-neutral-300">
                <li>
                  <a href="/cum-platesc" className="hover:text-white">
                    Cum plătesc
                  </a>
                </li>
                <li>
                  <a href="/cum-cumperi" className="hover:text-white">
                    Cum cumpăr
                  </a>
                </li>
                <li>
                  <a href="/services" className="hover:text-white">
                    Servicii
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Date comerciale
              </p>
              <ul className="space-y-1 text-neutral-300">
                <li>Monvelli Exclusive SRL</li>
                <li>Nr. Reg. Com.: J40/5819/2020</li>
                <li>C.U.I.: 42578035</li>
                <li>Capital social: 200 RON</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-800 bg-black py-3 text-center text-[11px] text-neutral-500">
          smart-lock.ro © {new Date().getFullYear()} | Toate drepturile rezervate
        </div>
      </section>
    </footer>
  );
}
