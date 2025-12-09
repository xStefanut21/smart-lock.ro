"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";

interface ProductSimpleAddToCartWithQuantityProps {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  disabled?: boolean;
}

export function ProductSimpleAddToCartWithQuantity({
  productId,
  name,
  price,
  imageUrl,
  disabled,
}: ProductSimpleAddToCartWithQuantityProps) {
  const [quantity, setQuantity] = useState(1);

  function handleDecrease() {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }

  function handleIncrease() {
    setQuantity((prev) => prev + 1);
  }

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900 text-xs">
        <button
          type="button"
          onClick={handleDecrease}
          className="flex h-8 w-8 items-center justify-center border-r border-neutral-700 text-neutral-200 hover:bg-neutral-800"
          aria-label="Scade cantitatea"
        >
          −
        </button>
        <div className="flex h-8 min-w-[2.5rem] items-center justify-center px-2 text-sm font-medium text-white">
          {quantity}
        </div>
        <button
          type="button"
          onClick={handleIncrease}
          className="flex h-8 w-8 items-center justify-center border-l border-neutral-700 text-neutral-200 hover:bg-neutral-800"
          aria-label="Crește cantitatea"
        >
          +
        </button>
      </div>

      <div className="flex-1">
        <AddToCartButton
          productId={productId}
          name={name}
          price={price}
          imageUrl={imageUrl ?? null}
          disabled={disabled}
          quantity={quantity}
        />
      </div>
    </div>
  );
}
