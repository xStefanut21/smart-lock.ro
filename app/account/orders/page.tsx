"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  awb_number: string | null;
  awb_added_at: string | null;
}

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

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

      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, status, total_amount, created_at, awb_number, awb_added_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(ordersData ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă comenzile tale...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
      <h1 className="mb-2 text-3xl font-semibold text-white">Comenzile mele</h1>
      {orders.length === 0 ? (
        <p className="text-xs text-neutral-400">
          Nu ai încă nicio comandă înregistrată.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/60">
          <table className="min-w-full border-separate border-spacing-0 text-xs">
            <thead className="bg-neutral-900/80 text-neutral-300">
              <tr>
                <th className="px-3 py-2 text-left font-medium">ID comandă</th>
                <th className="px-3 py-2 text-left font-medium">Dată</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">AWB</th>
                <th className="px-3 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/account/orders/${order.id}`)}
                  className={`${
                    index % 2 === 0 ? "bg-neutral-950" : "bg-neutral-900/70"
                  } cursor-pointer hover:bg-neutral-800/80`}
                >
                  <td className="px-3 py-2 align-middle text-neutral-200">
                    <span className="inline-block max-w-[180px] truncate align-middle">
                      {order.id}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-middle text-neutral-300">
                    {new Date(order.created_at).toLocaleString("ro-RO")}
                  </td>
                  <td className="px-3 py-2 align-middle text-neutral-300">
                    {order.status}
                  </td>
                  <td className="px-3 py-2 align-middle text-neutral-300">
                    {order.awb_number ? (
                      <div className="flex flex-col">
                        <span className="font-mono text-xs">{order.awb_number}</span>
                        {order.awb_added_at && (
                          <span className="text-[10px] text-neutral-500">
                            {new Date(order.awb_added_at).toLocaleDateString("ro-RO")}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-500">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right align-middle text-neutral-100">
                    {new Intl.NumberFormat("ro-RO", {
                      style: "currency",
                      currency: "RON",
                    }).format(order.total_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
