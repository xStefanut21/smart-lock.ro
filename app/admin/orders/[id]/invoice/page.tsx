"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AdminOrder = {
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
};

type AdminOrderItem = {
  id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  product_name: string | null;
  product_slug?: string | null;
  product_image_url?: string | null;
  color?: string | null;
};

export default function AdminOrderInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [items, setItems] = useState<AdminOrderItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/login?redirect=/admin/orders/${id}/invoice`);
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

      setCheckingAuth(false);

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          "id, status, total_amount, shipping_cost, vat_amount, created_at, shipping_method, payment_provider, payment_reference, shipping_address, billing_address, comment, account_type, company_name, company_cui, company_reg_com"
        )
        .eq("id", id)
        .maybeSingle<AdminOrder>();

      if (orderError || !orderData) {
        setError("Nu am putut încărca detaliile comenzii.");
        setLoading(false);
        return;
      }

      const { data: itemsData } = await supabase
        .from("order_items")
        .select("id, product_id, quantity, unit_price, color, products(name, slug, image_url)")
        .eq("order_id", id);

      const mappedItems: AdminOrderItem[] = (itemsData || []).map((row: any) => ({
        id: row.id,
        product_id: row.product_id,
        quantity: row.quantity,
        unit_price: row.unit_price,
        product_name: row.products?.name ?? null,
        product_slug: row.products?.slug ?? null,
        product_image_url: row.products?.image_url ?? null,
        color: row.color ?? null,
      }));

      setOrder(orderData);
      setItems(mappedItems);
      setLoading(false);
    }

    load();
  }, [id, router]);

  const totals = useMemo(() => {
    if (!order) return null;

    const shipping = order.shipping_cost || 0;
    const vat = order.vat_amount || 0;
    const gross = order.total_amount || 0;
    const net = gross - shipping - vat;

    return { net, shipping, vat, gross };
  }, [order]);

  if (!id) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-neutral-200">
        ID-ul comenzii lipsește.
      </div>
    );
  }

  if (checkingAuth || loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă factura...
      </div>
    );
  }

  if (error || !order || !totals) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-neutral-200">
        <p className="mb-3 text-xs text-red-400">{error || "Factura nu poate fi afișată."}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          ← Înapoi
        </button>
      </div>
    );
  }

  const billing = order.billing_address || {};
  const shippingAddr = order.shipping_address || {};

  return (
    <div className="bg-white text-black">
      <div className="mx-auto max-w-3xl px-4 py-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border border-neutral-300 px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
          >
            ← Înapoi
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded bg-black px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800"
          >
            Print / Salvează PDF
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-10 pt-2">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">FACTURĂ (draft)</div>
            <div className="text-xs text-neutral-700">Comandă: #{order.id}</div>
            <div className="text-xs text-neutral-700">
              Data: {new Date(order.created_at).toLocaleDateString("ro-RO")}
            </div>
          </div>
          <div className="text-right text-xs text-neutral-700">
            <div className="font-semibold text-black">Smart-Lock.ro</div>
            <div>București, România</div>
            <div>Telefon: 0741119449</div>
            <div>Email: stefan.prodan@monvelli.ro</div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded border border-neutral-200 p-3">
            <div className="mb-2 text-xs font-semibold text-neutral-700">Facturare</div>
            <div className="text-sm font-medium">{billing.name || "-"}</div>
            {billing.email && <div className="text-xs text-neutral-700">{billing.email}</div>}
            {billing.phone && <div className="text-xs text-neutral-700">{billing.phone}</div>}
            <div className="mt-1 text-xs text-neutral-700">
              {billing.line1 || "-"}
              {(billing.city || billing.county) && (
                <>
                  <br />
                  {billing.city || ""}
                  {billing.city && billing.county ? ", " : ""}
                  {billing.county || ""}
                </>
              )}
              {billing.postal_code && (
                <>
                  <br />
                  Cod poștal: {billing.postal_code}
                </>
              )}
            </div>

            {order.account_type === "pj" && (order.company_name || order.company_cui || order.company_reg_com) && (
              <div className="mt-3 rounded border border-neutral-200 bg-neutral-50 p-2 text-xs text-neutral-700">
                <div className="font-semibold text-neutral-800">Date firmă</div>
                {order.company_name && <div>{order.company_name}</div>}
                {order.company_cui && <div>CUI: {order.company_cui}</div>}
                {order.company_reg_com && <div>Nr. Reg. Com.: {order.company_reg_com}</div>}
              </div>
            )}
          </div>

          <div className="rounded border border-neutral-200 p-3">
            <div className="mb-2 text-xs font-semibold text-neutral-700">Livrare</div>
            <div className="text-sm font-medium">{shippingAddr.name || billing.name || "-"}</div>
            {(shippingAddr.email || billing.email) && (
              <div className="text-xs text-neutral-700">{shippingAddr.email || billing.email}</div>
            )}
            {(shippingAddr.phone || billing.phone) && (
              <div className="text-xs text-neutral-700">{shippingAddr.phone || billing.phone}</div>
            )}
            <div className="mt-1 text-xs text-neutral-700">
              {shippingAddr.line1 || billing.line1 || "-"}
              {(shippingAddr.city || billing.city || shippingAddr.county || billing.county) && (
                <>
                  <br />
                  {shippingAddr.city || billing.city || ""}
                  {(shippingAddr.city || billing.city) && (shippingAddr.county || billing.county) ? ", " : ""}
                  {shippingAddr.county || billing.county || ""}
                </>
              )}
              {(shippingAddr.postal_code || billing.postal_code) && (
                <>
                  <br />
                  Cod poștal: {shippingAddr.postal_code || billing.postal_code}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded border border-neutral-200">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-neutral-700">Produs</th>
                <th className="px-3 py-2 text-center font-semibold text-neutral-700">Cant.</th>
                <th className="px-3 py-2 text-right font-semibold text-neutral-700">Preț</th>
                <th className="px-3 py-2 text-right font-semibold text-neutral-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}>
                  <td className="px-3 py-2 align-top">
                    <div className="flex items-center gap-2">
                      {item.product_slug && item.product_image_url ? (
                        <a href={`/products/${encodeURIComponent(item.product_slug)}`}>
                          <img
                            src={item.product_image_url}
                            alt={item.product_name || "Produs"}
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded border border-neutral-200 bg-white object-contain"
                          />
                        </a>
                      ) : item.product_image_url ? (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name || "Produs"}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded border border-neutral-200 bg-white object-contain"
                        />
                      ) : null}
                      <div className="font-medium text-neutral-900">
                        {item.product_slug ? (
                          <a
                            href={`/products/${encodeURIComponent(item.product_slug)}`}
                            className="hover:underline"
                          >
                            {item.product_name || item.product_id || "Produs"}
                          </a>
                        ) : (
                          item.product_name || item.product_id || "Produs"
                        )}
                        {item.color ? ` (${item.color})` : ""}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center align-top text-neutral-800">{item.quantity}</td>
                  <td className="px-3 py-2 text-right align-top text-neutral-800">
                    {new Intl.NumberFormat("ro-RO", {
                      style: "currency",
                      currency: "RON",
                    }).format(item.unit_price)}
                  </td>
                  <td className="px-3 py-2 text-right align-top font-semibold text-neutral-900">
                    {new Intl.NumberFormat("ro-RO", {
                      style: "currency",
                      currency: "RON",
                    }).format(item.unit_price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-1 rounded border border-neutral-200 p-3 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-700">Produse</span>
              <span className="text-neutral-900">
                {new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(totals.net)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-700">Transport</span>
              <span className="text-neutral-900">
                {new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(totals.shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-700">TVA</span>
              <span className="text-neutral-900">
                {new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(totals.vat)}
              </span>
            </div>
            <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 text-sm font-semibold">
              <span>Total</span>
              <span>
                {new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(totals.gross)}
              </span>
            </div>
          </div>
        </div>

        {order.comment && (
          <div className="mt-4 rounded border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-800">
            <div className="mb-1 font-semibold">Comentariu client</div>
            <div className="whitespace-pre-wrap">{order.comment}</div>
          </div>
        )}

        <div className="mt-6 text-[10px] text-neutral-600">
          Document generat din panoul de administrare. Pentru facturare fiscală reală, adaugă seria/numărul facturii și datele complete ale emitentului.
        </div>
      </div>
    </div>
  );
}
