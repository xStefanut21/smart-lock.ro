"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setItems(JSON.parse(stored));
    }
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function syncAndSetItems(next: CartItem[]) {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  function handleIncrease(id: string) {
    syncAndSetItems(
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function handleDecrease(id: string) {
    syncAndSetItems(
      items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }

  function handleRemove(id: string) {
    syncAndSetItems(items.filter((item) => item.id !== id));
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
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-100"
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
                    <p className="text-xs text-neutral-400">
                      {new Intl.NumberFormat("ro-RO", {
                        style: "currency",
                        currency: "RON",
                      }).format(item.price / 100)}{" "}
                      / buc
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900 text-xs">
                    <button
                      type="button"
                      onClick={() => handleDecrease(item.id)}
                      className="flex h-7 w-7 items-center justify-center border-r border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      −
                    </button>
                    <div className="flex h-7 w-10 items-center justify-center text-sm text-white">
                      {item.quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleIncrease(item.id)}
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
                      }).format((item.price * item.quantity) / 100)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
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
              }).format(total / 100)}
            </span>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="mt-6 w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Continuă la checkout
          </button>
        </>
      )}
    </div>
  );
}
