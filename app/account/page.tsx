"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? null);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă datele contului...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-neutral-200">
      <div className="mx-auto max-w-xl rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 text-xs">
        <div className="-mt-10 mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-600 bg-red-600 text-white shadow-lg">
            <svg
              aria-hidden
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="3.2" />
              <path d="M6.5 19.2C7.7 16.9 9.7 15.5 12 15.5s4.3 1.4 5.5 3.7" />
            </svg>
          </div>
        </div>
        <h1 className="mb-2 text-center text-base font-semibold text-white">
          {email ?? "Contul meu"}
        </h1>
        <hr className="mb-3 border-neutral-800" />
        <ul className="space-y-1 text-neutral-200">
          <li>
            <button
              type="button"
              className="w-full text-left hover:text-white"
              onClick={() => router.push("/account/profile")}
            >
              ✏️ Editează informațiile contului
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full text-left hover:text-white"
              onClick={() => router.push("/account/password")}
            >
              🔐 Schimbă parola
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full text-left hover:text-white"
              onClick={() => router.push("/account/addresses")}
            >
              🏠 Modifică adresele
            </button>
          </li>
          <li>
            <button
              type="button"
              className="w-full text-left hover:text-white"
              onClick={() => router.push("/account/orders")}
            >
              📦 Vezi istoricul comenzilor
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
