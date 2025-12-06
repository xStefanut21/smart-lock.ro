"use client";

import { useRouter } from "next/navigation";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  price: number; // in bani
  imageUrl?: string | null;
}

export function AddToCartButton({ productId, name, price, imageUrl }: AddToCartButtonProps) {
  const router = useRouter();

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
    router.push("/cart");
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="mt-3 w-full rounded-md bg-blue-600 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
    >
      Adaugă în coș
    </button>
  );
}
