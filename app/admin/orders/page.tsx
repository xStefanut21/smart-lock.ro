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
  awb_number: string | null;
  awb_added_at: string | null;
  billing_address: {
    name?: string | null;
    phone?: string | null;
    line1?: string | null;
    city?: string | null;
  } | null;
  account_type?: "pf" | "pj" | null;
  company_name?: string | null;
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingAwb, setEditingAwb] = useState<string | null>(null);
  const [awbInput, setAwbInput] = useState("");
  const [savingAwb, setSavingAwb] = useState(false);

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
          "id, status, total_amount, created_at, shipping_method, payment_provider, awb_number, awb_added_at, billing_address, account_type, company_name"
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

  async function handleAwbSave(orderId: string) {
    setSavingAwb(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const updateData: any = {
      awb_number: awbInput.trim() || null,
    };

    if (awbInput.trim()) {
      updateData.awb_added_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    setSavingAwb(false);

    if (updateError) {
      setError(`Nu am putut actualiza AWB-ul: ${updateError.message || "eroare necunoscută"}`);
      return;
    }

    // Update local state
    setOrders((prev) => prev.map((order) => 
      order.id === orderId 
        ? { 
            ...order, 
            awb_number: awbInput.trim() || null,
            awb_added_at: awbInput.trim() ? new Date().toISOString() : null
          } 
        : order
    ));

    // Reset editing state
    setEditingAwb(null);
    setAwbInput("");
  }

  async function handleAwbDelete(orderId: string) {
    if (!confirm("Ești sigur că vrei să ștergi acest AWB?")) return;

    setSavingAwb(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("orders")
      .update({ 
        awb_number: null,
        awb_added_at: null
      })
      .eq("id", orderId);

    setSavingAwb(false);

    if (updateError) {
      setError(`Nu am putut șterge AWB-ul: ${updateError.message || "eroare necunoscută"}`);
      return;
    }

    // Update local state
    setOrders((prev) => prev.map((order) => 
      order.id === orderId 
        ? { 
            ...order, 
            awb_number: null,
            awb_added_at: null
          } 
        : order
    ));
  }

  function startEditingAwb(orderId: string, currentAwb: string | null) {
    setEditingAwb(orderId);
    setAwbInput(currentAwb || "");
  }

  function cancelEditingAwb() {
    setEditingAwb(null);
    setAwbInput("");
  }

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
                <th className="px-3 py-2 text-left font-medium">AWB</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
                <th className="px-3 py-2 text-right font-medium">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const billing = order.billing_address || {};
                const customerLabel =
                  (order.account_type === "pj" && order.company_name) ||
                  billing.name ||
                  billing.phone ||
                  `${billing.city || ""}`;

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
                    <td className="px-3 py-2 align-middle text-neutral-300">
                      {editingAwb === order.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={awbInput}
                            onChange={(e) => setAwbInput(e.target.value)}
                            placeholder="AWB..."
                            className="h-6 w-24 rounded border border-neutral-600 bg-neutral-800 px-2 text-xs text-neutral-100 outline-none focus:border-red-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleAwbSave(order.id)}
                            disabled={savingAwb}
                            className="h-6 rounded bg-green-600 px-2 text-[10px] text-white hover:bg-green-500 disabled:opacity-60"
                          >
                            ✓
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingAwb}
                            className="h-6 rounded bg-neutral-600 px-2 text-[10px] text-white hover:bg-neutral-500"
                          >
                            ✕
                          </button>
                        </div>
                      ) : order.awb_number ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs">{order.awb_number}</span>
                            {order.awb_added_at && (
                              <span className="text-[10px] text-neutral-500">
                                {new Date(order.awb_added_at).toLocaleDateString("ro-RO")}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => startEditingAwb(order.id, order.awb_number)}
                              className="h-6 w-6 rounded border border-neutral-600 bg-neutral-800 text-[10px] text-neutral-300 hover:border-blue-500 hover:text-blue-400"
                              title="Editează AWB"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAwbDelete(order.id)}
                              disabled={savingAwb}
                              className="h-6 w-6 rounded border border-neutral-600 bg-neutral-800 text-[10px] text-neutral-300 hover:border-red-500 hover:text-red-400 disabled:opacity-60"
                              title="Șterge AWB"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-500">-</span>
                          <button
                            type="button"
                            onClick={() => startEditingAwb(order.id, null)}
                            className="h-6 rounded border border-neutral-600 bg-neutral-800 px-2 text-[10px] text-neutral-300 hover:border-green-500 hover:text-green-400"
                          >
                            + AWB
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right align-middle text-neutral-100">
                      {new Intl.NumberFormat("ro-RO", {
                        style: "currency",
                        currency: "RON",
                      }).format(order.total_amount)}
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
