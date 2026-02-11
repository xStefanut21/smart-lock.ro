"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  color?: string;
  hasInstallation?: boolean;
  installationPrice?: number;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session?.user);
    });

    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        const raw = JSON.parse(stored) as CartItem[];
        // normalizăm: o singură intrare per combinație (id, color), cu cantități adunate
        const map = new Map<string, CartItem>();
        for (const item of raw) {
          const key = `${item.id}__${item.color ?? ""}__${item.hasInstallation ? "with-install" : "no-install"}`;
          const existing = map.get(key);
          if (existing) {
            map.set(key, {
              ...existing,
              quantity: existing.quantity + (item.quantity ?? 1),
            });
          } else {
            map.set(key, {
              ...item,
              quantity: item.quantity ?? 1,
            });
          }
        }
        const normalized = Array.from(map.values());
        setItems(normalized);
        localStorage.setItem("cart", JSON.stringify(normalized));
      } catch {
        setItems([]);
      }
    }
  }, []);

  // prețurile din cart sunt în RON (aceeași valoare ca pe cardul de produs)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function syncAndSetItems(next: CartItem[]) {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
    // anunțăm restul aplicației (ex. NavCartIndicator) că s-a schimbat coșul
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "cart", newValue: JSON.stringify(next) })
      );
    }
  }

  function handleIncrease(id: string, color?: string, hasInstallation?: boolean) {
    syncAndSetItems(
      items.map((item) =>
        item.id === id && item.color === color && item.hasInstallation === hasInstallation
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function handleDecrease(id: string, color?: string, hasInstallation?: boolean) {
    syncAndSetItems(
      items.map((item) =>
        item.id === id && item.color === color && item.hasInstallation === hasInstallation && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }

  function handleRemove(id: string, color?: string, hasInstallation?: boolean) {
    syncAndSetItems(items.filter((item) => !(item.id === id && item.color === color && item.hasInstallation === hasInstallation)));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold text-white">Coș de cumpărături</h1>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">Coșul este gol.</p>
      ) : (
        <>
          <ul className="mb-6 space-y-3">
            {items.map((item) => (
              <li
                key={`${item.id}-${item.color ?? "_"}-${item.hasInstallation ? "with-install" : "no-install"}`}
                className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-100 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-neutral-500">Fără imagine</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-white">{item.name}</p>
                    {item.color && (
                      <p className="text-[11px] text-neutral-400">Culoare: {item.color}</p>
                    )}
                    <p className="text-xs text-neutral-400">
                      {new Intl.NumberFormat("ro-RO", {
                        style: "currency",
                        currency: "RON",
                      }).format(item.price - (item.installationPrice || 0))} / buc
                    </p>
                    {item.hasInstallation && item.installationPrice && (
                      <div className="mt-1 rounded-md border border-neutral-700 bg-neutral-900 p-2">
                        <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Montaj Expert inclus</span>
                        </div>
                        <div className="mt-1 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-neutral-400">Produs:</span>
                            <span className="text-neutral-200">
                              {new Intl.NumberFormat("ro-RO", {
                                style: "currency",
                                currency: "RON",
                              }).format(item.price - item.installationPrice)}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-neutral-400">Montaj:</span>
                            <span className="text-emerald-400">
                              {new Intl.NumberFormat("ro-RO", {
                                style: "currency",
                                currency: "RON",
                              }).format(item.installationPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900 text-xs">
                    <button
                      type="button"
                      onClick={() => handleDecrease(item.id, item.color, item.hasInstallation)}
                      className="flex h-7 w-7 items-center justify-center border-r border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      −
                    </button>
                    <div className="flex h-7 w-10 items-center justify-center text-sm text-white">
                      {item.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleIncrease(item.id, item.color, item.hasInstallation)}
                      className="flex h-7 w-7 items-center justify-center border-l border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right text-sm">
                    <p className="text-white">
                      {new Intl.NumberFormat("ro-RO", {
                        style: "currency",
                        currency: "RON",
                      }).format(item.price * item.quantity)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id, item.color, item.hasInstallation)}
                    className="ml-1 text-xs text-red-400 hover:text-red-300"
                    aria-label="Șterge produsul din coș"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-neutral-800 pt-4 text-sm text-neutral-100">
            <span>Total estimat</span>
            <span>
              {new Intl.NumberFormat("ro-RO", {
                style: "currency",
                currency: "RON",
              }).format(total)}
            </span>
          </div>
          <button
            type="button"
            disabled={isLoggedIn === false}
            onClick={() => {
              if (isLoggedIn) {
                router.push("/checkout");
              }
            }}
            className={`mt-6 w-full rounded-md py-2 text-sm font-medium transition-colors ${
              isLoggedIn === false
                ? "cursor-not-allowed bg-neutral-800 text-neutral-400"
                : "bg-blue-600 text-white hover:bg-blue-500"
            }`}
          >
            {isLoggedIn === false
              ? "Vă rugăm să vă conectați sau să vă creați un cont pentru a putea continua la pagina de checkout."
              : "Continuă la checkout"}
          </button>

          {isLoggedIn === false && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 sm:w-auto"
              >
                Creează-ți un cont
              </button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 sm:w-auto"
              >
                Conectează-te în contul tău
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
