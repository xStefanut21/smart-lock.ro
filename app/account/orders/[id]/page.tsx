"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Order {
  id: string;
  status: string | null;
  total_amount: number;
  shipping_cost: number | null;
  vat_amount: number | null;
  created_at: string;
  shipping_method: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  shipping_address: any | null;
  billing_address: any | null;
  comment?: string | null;
  account_type?: "pf" | "pj" | null;
  company_name?: string | null;
  company_cui?: string | null;
  company_reg_com?: string | null;
}

interface OrderItem {
  id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  product_name: string | null;
  color?: string | null;
}

export default function AccountOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // încărcăm comanda doar dacă aparține utilizatorului logat
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          "id, status, total_amount, shipping_cost, vat_amount, created_at, shipping_method, payment_provider, payment_reference, shipping_address, billing_address, comment, user_id, account_type, company_name, company_cui, company_reg_com"
        )
        .eq("id", id)
        .maybeSingle<any>();

      if (orderError || !orderData || orderData.user_id !== user.id) {
        setError("Comanda nu a fost găsită.");
        setLoading(false);
        return;
      }

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("id, product_id, quantity, unit_price, color, products(name)")
        .eq("order_id", id);

      const mappedItems: OrderItem[] = (itemsData || []).map((row: any) => ({
        id: row.id,
        product_id: row.product_id,
        quantity: row.quantity,
        unit_price: row.unit_price,
        product_name: row.products?.name ?? null,
        color: row.color ?? null,
      }));

      setOrder(orderData as Order);
      setItems(mappedItems);
      setLoading(false);
    }

    load();
  }, [id, router]);

  if (!id) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
        ID-ul comenzii lipsește.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă detaliile comenzii...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
        <p className="mb-3 text-xs text-red-400">{error || "Comanda nu a fost găsită."}</p>
        <button
          type="button"
          onClick={() => router.push("/account/orders")}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          ← Înapoi la comenzile mele
        </button>
      </div>
    );
  }

  const billing = order.billing_address || {};
  const shipping = order.shipping_address || {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-xs text-neutral-400 hover:text-white"
      >
        ← Înapoi
      </button>

      <h1 className="mb-2 text-xl font-semibold text-white">Comanda #{order.id}</h1>
      <p className="mb-4 text-xs text-neutral-400">
        Plasată la {new Date(order.created_at).toLocaleString("ro-RO")} · status: {" "}
        <span className="font-medium text-neutral-100">{order.status || "nouă"}</span>
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs">
          <h2 className="mb-1 text-sm font-semibold text-white">Date facturare</h2>
          {order.account_type === "pj" && order.company_name && (
            <div className="mb-2 space-y-1 rounded-md border border-neutral-800 bg-neutral-900/60 p-3 text-[11px] text-neutral-200">
              <p className="font-medium text-neutral-100">Comandă pe persoană juridică</p>
              <p>{order.company_name}</p>
              {(order.company_cui || order.company_reg_com) && (
                <p className="text-neutral-300">
                  {order.company_cui && <span>CUI: {order.company_cui}</span>}
                  {order.company_cui && order.company_reg_com && (
                    <span className="mx-1">•</span>
                  )}
                  {order.company_reg_com && (
                    <span>Nr. Reg. Com.: {order.company_reg_com}</span>
                  )}
                </p>
              )}
            </div>
          )}
          <p>{billing.name || "-"}</p>
          <p className="text-neutral-300">{billing.phone || "-"}</p>
          <p className="text-neutral-300">{billing.line1 || "-"}</p>
          <p className="text-neutral-400">
            {billing.city || ""}
            {billing.city && billing.county ? ", " : ""}
            {billing.county || ""}
          </p>
          {billing.postal_code && (
            <p className="text-neutral-400">Cod poștal: {billing.postal_code}</p>
          )}
        </section>

        <section className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs">
          <h2 className="mb-1 text-sm font-semibold text-white">Adresă livrare</h2>
          <p>{shipping.name || billing.name || "-"}</p>
          <p className="text-neutral-300">{shipping.phone || billing.phone || "-"}</p>
          <p className="text-neutral-300">{shipping.line1 || billing.line1 || "-"}</p>
          <p className="text-neutral-400">
            {shipping.city || billing.city || ""}
            {(shipping.city || billing.city) && (shipping.county || billing.county)
              ? ", "
              : ""}
            {shipping.county || billing.county || ""}
          </p>
          {(shipping.postal_code || billing.postal_code) && (
            <p className="text-neutral-400">
              Cod poștal: {shipping.postal_code || billing.postal_code}
            </p>
          )}
        </section>
      </div>

      <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)]">
        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-200">
          <h2 className="mb-1 text-sm font-semibold text-white">Produse din comandă</h2>
          {items.length === 0 ? (
            <p className="text-xs text-neutral-400">Nu există produse asociate.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 border-b border-neutral-900 pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-[13px] text-neutral-100">
                      {item.product_name || item.product_id || "Produs"}
                    </p>
                    {item.color && (
                      <p className="text-[11px] text-neutral-400">Culoare: {item.color}</p>
                    )}
                    <p className="text-[11px] text-neutral-400">Cantitate: {item.quantity}</p>
                  </div>
                  <div className="text-right text-[13px] text-neutral-100">
                    <p>
                      {new Intl.NumberFormat("ro-RO", {
                        style: "currency",
                        currency: "RON",
                      }).format(item.unit_price * item.quantity)}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      ({new Intl.NumberFormat("ro-RO", {
                        style: "currency",
                        currency: "RON",
                      }).format(item.unit_price)} / buc)
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs text-neutral-200">
          <h2 className="mb-1 text-sm font-semibold text-white">Rezumat plată</h2>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Produse</span>
              <span>
                {new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(order.total_amount - (order.shipping_cost || 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span>TVA</span>
              <span>
                {new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(order.vat_amount || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Transport</span>
              <span>
                {new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(order.shipping_cost || 0)}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-neutral-800 pt-2 text-sm font-semibold">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(order.total_amount)}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-2 text-[11px] text-neutral-400">
            <div className="space-y-1">
              <p>
                Metodă livrare: <span className="text-neutral-200">{order.shipping_method}</span>
              </p>
              <p>
                Metodă plată: <span className="text-neutral-200">{order.payment_provider}</span>
              </p>
              {order.payment_reference && (
                <p>
                  Referință plată: {" "}
                  <span className="text-neutral-200">{order.payment_reference}</span>
                </p>
              )}
            </div>

            {order.comment && (
              <div className="mt-2 rounded border border-neutral-800 bg-neutral-950 p-2 text-[11px] text-neutral-200">
                <p className="mb-1 font-semibold text-white">Comentariul tău pentru această comandă</p>
                <p className="whitespace-pre-wrap text-neutral-300">{order.comment}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
