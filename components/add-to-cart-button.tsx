"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number; // in bani
  imageUrl?: string | null;
  disabled?: boolean;
  quantity?: number;
  hasInstallation?: boolean;
  installationPrice?: number;
  color?: string;
}

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
  disabled,
  quantity,
  hasInstallation,
  installationPrice,
  color,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("cart");
      if (!raw) return;
      const cart = JSON.parse(raw) as { id: string }[];
      const exists = cart.some((item) => item.id === productId);
      setInCart(exists);
    } catch {
      setInCart(false);
    }
  }, [productId, color, hasInstallation]);

  function handleAdd() {
    const qty = quantity && quantity > 0 ? quantity : 1;
    const raw = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
    const cart = raw ? JSON.parse(raw) : [];

    // Create key for finding existing items (including installation and color)
    const key = `${productId}__${color ?? ""}__${hasInstallation ? "with-install" : "no-install"}`;
    const existing = cart.find((item: any) => 
      item.id === productId && 
      item.color === (color || null) && 
      item.hasInstallation === (hasInstallation || false)
    );
    
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({ 
        id: productId, 
        name, 
        price, 
        quantity: qty, 
        image: imageUrl ?? null,
        color: color || null,
        hasInstallation: hasInstallation || false,
        installationPrice: (hasInstallation && installationPrice) ? installationPrice : 0,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    // anunțăm restul aplicației (ex. NavCartIndicator) că s-a schimbat coșul
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "cart", newValue: JSON.stringify(cart) })
      );
    }

    setInCart(true);
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
        {inCart ? "În coș" : "Adaugă în coș"}
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
