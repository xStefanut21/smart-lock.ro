"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login?redirect=/admin");
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

      setEmail(user.email ?? null);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
        Se verifică drepturile de administrator...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6">
        <h1 className="mb-1 text-lg font-semibold text-white">
          Panou administrator smart-lock.ro
        </h1>
        <p className="text-xs text-neutral-400">
          Autentificat ca {email ?? "administrator"}. Doar conturile cu drepturi de admin pot vedea această pagină.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="flex flex-col items-start rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 text-left text-xs hover:border-red-600 hover:bg-neutral-900"
        >
          <span className="mb-1 text-sm font-semibold text-white">
            📦 Administrare produse
          </span>
          <span className="text-neutral-400">
            Adaugă, editează, actualizează stocul și pozele produselor afișate pe site.
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/orders")}
          className="flex flex-col items-start rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 text-left text-xs hover:border-red-600 hover:bg-neutral-900"
        >
          <span className="mb-1 text-sm font-semibold text-white">
            📑 Administrare comenzi
          </span>
          <span className="text-neutral-400">
            Vezi toate comenzile, verifică adresele și urmărește statusul livrării.
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/banners")}
          className="flex flex-col items-start rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 text-left text-xs hover:border-red-600 hover:bg-neutral-900"
        >
          <span className="mb-1 text-sm font-semibold text-white">
            🖼️ Bannere homepage
          </span>
          <span className="text-neutral-400">
            Gestionează imaginile afișate în sliderul de pe pagina principală.
          </span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/reviews")}
          className="flex flex-col items-start rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 text-left text-xs hover:border-red-600 hover:bg-neutral-900"
        >
          <span className="mb-1 text-sm font-semibold text-white">
            ⭐ Review-uri produse
          </span>
          <span className="text-neutral-400">
            Vezi, aprobă sau șterge review-urile lăsate de clienți pentru produse.
          </span>
        </button>
      </div>
    </div>
  );
}
