"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number; // in bani
  imageUrl?: string | null;
  disabled?: boolean;
}

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
  disabled,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleAdd() {
    const raw = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
    const cart = raw ? JSON.parse(raw) : [];

    const existing = cart.find((item: any) => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: productId, name, price, quantity: 1, image: imageUrl ?? null });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // anunțăm restul aplicației (ex. NavCartIndicator) că s-a schimbat coșul
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "cart", newValue: JSON.stringify(cart) })
      );
    }

    setShowConfirm(true);
  }

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="mt-3 w-full rounded-md bg-neutral-800 py-1.5 text-sm font-medium text-neutral-400 cursor-not-allowed"
      >
        Stoc epuizat
      </button>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-md bg-blue-600 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
      >
        Adaugă în coș
      </button>

      {showConfirm && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-5 text-xs text-neutral-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              className="ml-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full border border-neutral-700 text-[10px] text-neutral-400 hover:border-neutral-500 hover:text-neutral-100"
              aria-label="Închide"
            >
              ×
            </button>
            <p className="mb-1 text-center text-[13px] font-semibold text-white">
              PRODUS ADĂUGAT ÎN COȘ
            </p>
            <p className="mb-4 text-center text-[12px] text-neutral-400">
              Ce dorești să faci în continuare?
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-center text-[11px] text-neutral-200 hover:border-blue-500 hover:text-white"
              >
                « Continuă cumpărăturile
              </button>
              <button
                type="button"
                onClick={() => router.push("/cart")}
                className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-center text-[11px] font-semibold text-white hover:bg-blue-500"
              >
                Vezi coșul de cumpărături
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
