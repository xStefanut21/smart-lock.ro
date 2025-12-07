"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AdminOrder = {
  id: string;
  status: string | null;
  total_amount: number;
  created_at: string;
  shipping_method: string | null;
  payment_provider: string | null;
  billing_address: {
    name?: string | null;
    phone?: string | null;
    line1?: string | null;
    city?: string | null;
  } | null;
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/admin/orders");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile || profile.is_admin !== true) {
        router.replace("/");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, status, total_amount, created_at, shipping_method, payment_provider, billing_address"
        )
        .order("created_at", { ascending: false });

      if (error) {
        setError("Nu am putut încărca comenzile. Încearcă din nou.");
        setLoading(false);
        return;
      }

      setOrders((data as AdminOrder[]) ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă lista de comenzi...
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
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Administrare comenzi</h1>
          <p className="text-xs text-neutral-400">
            Vezi toate comenzile plasate în magazin și urmărește statusul lor.
          </p>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {orders.length === 0 ? (
        <p className="text-xs text-neutral-400">Nu există încă nicio comandă.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/60">
          <table className="min-w-full border-separate border-spacing-0 text-xs text-neutral-200">
            <thead className="bg-neutral-950/80 text-neutral-300">
              <tr>
                <th className="px-3 py-2 text-left font-medium">ID comandă</th>
                <th className="px-3 py-2 text-left font-medium">Dată</th>
                <th className="px-3 py-2 text-left font-medium">Client</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Livrare / Plată</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
                <th className="px-3 py-2 text-right font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const billing = order.billing_address || {};
                const customerLabel =
                  billing.name || billing.phone || `${billing.city || ""}`;

                return (
                  <tr
                    key={order.id}
                    className={
                      index % 2 === 0 ? "bg-neutral-950" : "bg-neutral-900/70"
                    }
                  >
                    <td className="max-w-[180px] px-3 py-2 align-middle text-neutral-200">
                      <span className="inline-block max-w-full truncate align-middle">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-middle text-neutral-300">
                      {new Date(order.created_at).toLocaleString("ro-RO")}
                    </td>
                    <td className="px-3 py-2 align-middle text-neutral-300">
                      {customerLabel || "-"}
                    </td>
                    <td className="px-3 py-2 align-middle text-neutral-300">
                      {order.status || "nouă"}
                    </td>
                    <td className="px-3 py-2 align-middle text-[11px] text-neutral-400">
                      <div>{order.shipping_method || "-"}</div>
                      <div>{order.payment_provider || "-"}</div>
                    </td>
                    <td className="px-3 py-2 text-right align-middle text-neutral-100">
                      {new Intl.NumberFormat("ro-RO", {
                        style: "currency",
                        currency: "RON",
                      }).format(order.total_amount / 100)}
                    </td>
                    <td className="px-3 py-2 text-right align-middle text-neutral-100">
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                        className="rounded-md border border-neutral-700 px-2 py-1 text-[11px] text-neutral-200 hover:border-red-500 hover:text-white"
                      >
                        Detalii
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
