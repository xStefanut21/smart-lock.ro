"use client";

import { useState } from "react";
import { ProductSimpleAddToCartWithQuantity } from "./product-simple-add-to-cart-with-quantity";
import { ProductColorAddToCart } from "./product-color-add-to-cart";
import { AddToCartButton } from "./add-to-cart-button";

interface ProductAddToCartWithInstallationProps {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stockAvailable: boolean;
  hasInstallationOption: boolean;
  installationPrice: number | null;
  colors?: string[];
}

export function ProductAddToCartWithInstallation({
  productId,
  name,
  price,
  imageUrl,
  stockAvailable,
  hasInstallationOption,
  installationPrice,
  colors,
}: ProductAddToCartWithInstallationProps) {
  const [withInstallation, setWithInstallation] = useState(false);
  
  const basePrice = price;
  const installationCost = withInstallation && installationPrice ? installationPrice : 0;
  const totalPrice = basePrice + installationCost;

  // Enhanced AddToCartButton that supports installation
  const EnhancedAddToCartButton = ({ 
    productId, 
    name, 
    price, 
    imageUrl, 
    disabled, 
    quantity,
    hasInstallation,
    installationPrice,
    color
  }: {
    productId: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    disabled?: boolean;
    quantity?: number;
    hasInstallation?: boolean;
    installationPrice?: number;
    color?: string;
  }) => {
    const [showConfirm, setShowConfirm] = useState(false);
    const [inCart, setInCart] = useState(false);

    const handleAddToCart = () => {
      const cartItem = {
        id: productId,
        name: color ? `${name} (${color})` : name,
        price: price,
        quantity: quantity || 1,
        image: imageUrl,
        color: color || undefined,
        hasInstallation: hasInstallation || false,
        installationPrice: hasInstallation ? installationPrice || 0 : 0,
      };

      const existing = localStorage.getItem("cart");
      const cart = existing ? JSON.parse(existing) : [];
      cart.push(cartItem);
      localStorage.setItem("cart", JSON.stringify(cart));

      // Trigger storage event to update cart indicator
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new StorageEvent("storage", { key: "cart", newValue: JSON.stringify(cart) })
        );
      }

      // Show confirmation feedback
      setShowConfirm(true);
      setInCart(true);
      setTimeout(() => {
        setShowConfirm(false);
        setInCart(false);
      }, 2000);
    };

    return (
      <button
        onClick={handleAddToCart}
        disabled={disabled}
        className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-all ${
          disabled
            ? "cursor-not-allowed bg-neutral-800 text-neutral-400"
            : showConfirm
            ? "bg-emerald-600 text-white"
            : inCart
            ? "bg-emerald-600 text-white"
            : "bg-red-600 text-white hover:bg-red-500"
        }`}
      >
        {disabled
          ? "Stoc epuizat"
          : showConfirm
          ? "✓ Adăugat în coș"
          : inCart
          ? "✓ Adăugat în coș"
          : "Adaugă în coș"}
      </button>
    );
  };

  if (colors && colors.length > 0) {
    return (
      <div className="space-y-4">
        {hasInstallationOption && (
          <div className="rounded-md border border-neutral-800 bg-neutral-950/60 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
              Opțiuni montaj
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="installation"
                  checked={!withInstallation}
                  onChange={() => setWithInstallation(false)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600"
                />
                <span className="text-sm text-neutral-200">Fără montaj</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="installation"
                  checked={withInstallation}
                  onChange={() => setWithInstallation(true)}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600"
                />
                <span className="text-sm text-neutral-200">
                  Montaj Expert (+{new Intl.NumberFormat("ro-RO", {
                    style: "currency",
                    currency: "RON",
                  }).format(installationPrice || 0)})
                </span>
              </label>
            </div>
          </div>
        )}
        
        <div className="rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-200">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span>Produs:</span>
              <span>{new Intl.NumberFormat("ro-RO", {
                style: "currency",
                currency: "RON",
              }).format(basePrice)}</span>
            </div>
            {withInstallation && installationPrice && (
              <div className="flex justify-between">
                <span>Montaj:</span>
                <span>{new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(installationPrice)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-700 pt-2 font-semibold">
              <span>Total:</span>
              <span className="text-blue-400">{new Intl.NumberFormat("ro-RO", {
                style: "currency",
                currency: "RON",
              }).format(totalPrice)}</span>
            </div>
          </div>
        </div>

        <ProductColorAddToCartWithInstallation
          productId={productId}
          name={name}
          price={totalPrice}
          imageUrl={imageUrl}
          stockAvailable={stockAvailable}
          colors={colors}
          hasInstallation={withInstallation}
          installationPrice={withInstallation ? (installationPrice || 0) : 0}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasInstallationOption && (
        <div className="rounded-md border border-neutral-800 bg-neutral-950/60 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
            Opțiuni montaj
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="installation"
                checked={!withInstallation}
                onChange={() => setWithInstallation(false)}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600"
              />
              <span className="text-sm text-neutral-200">Fără montaj</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="installation"
                checked={withInstallation}
                onChange={() => setWithInstallation(true)}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600"
              />
              <span className="text-sm text-neutral-200">
                Montaj Expert (+{new Intl.NumberFormat("ro-RO", {
                  style: "currency",
                  currency: "RON",
                }).format(installationPrice || 0)})
              </span>
            </label>
          </div>
        </div>
      )}
      
      <div className="rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-200">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span>Produs:</span>
            <span>{new Intl.NumberFormat("ro-RO", {
              style: "currency",
              currency: "RON",
            }).format(basePrice)}</span>
          </div>
          {withInstallation && installationPrice && (
            <div className="flex justify-between">
              <span>Montaj:</span>
              <span>{new Intl.NumberFormat("ro-RO", {
                style: "currency",
                currency: "RON",
              }).format(installationPrice)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-700 pt-2 font-semibold">
            <span>Total:</span>
            <span className="text-blue-400">{new Intl.NumberFormat("ro-RO", {
              style: "currency",
              currency: "RON",
            }).format(totalPrice)}</span>
          </div>
        </div>
      </div>

      <ProductSimpleAddToCartWithInstallation
        productId={productId}
        name={name}
        price={totalPrice}
        imageUrl={imageUrl}
        stockAvailable={stockAvailable}
        hasInstallation={withInstallation}
        installationPrice={withInstallation ? (installationPrice || 0) : 0}
      />
    </div>
  );
}

// Simple product component with installation support
function ProductSimpleAddToCartWithInstallation({
  productId,
  name,
  price,
  imageUrl,
  stockAvailable,
  hasInstallation,
  installationPrice,
}: {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stockAvailable: boolean;
  hasInstallation: boolean;
  installationPrice: number;
}) {
  const [quantity, setQuantity] = useState(1);

  function handleDecrease() {
    setQuantity((prev: number) => (prev > 1 ? prev - 1 : 1));
  }

  function handleIncrease() {
    setQuantity((prev: number) => prev + 1);
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
          imageUrl={imageUrl}
          disabled={!stockAvailable}
          quantity={quantity}
          hasInstallation={hasInstallation}
          installationPrice={installationPrice}
        />
      </div>
    </div>
  );
}

// Component for products with colors and installation support
function ProductColorAddToCartWithInstallation({
  productId,
  name,
  price,
  imageUrl,
  stockAvailable,
  colors,
  hasInstallation,
  installationPrice,
}: {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stockAvailable: boolean;
  colors: string[];
  hasInstallation: boolean;
  installationPrice: number;
}) {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [quantity, setQuantity] = useState(1);

  function handleDecrease() {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }

  function handleIncrease() {
    setQuantity((prev) => prev + 1);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-neutral-300">Culoare:</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`rounded-md border px-3 py-1 text-xs ${
                selectedColor === color
                  ? "border-red-500 bg-red-500/20 text-red-400"
                  : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-600"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      
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
            name={`${name} (${selectedColor})`}
            price={price}
            imageUrl={imageUrl}
            disabled={!stockAvailable}
            quantity={quantity}
            hasInstallation={hasInstallation}
            installationPrice={installationPrice}
            color={selectedColor}
          />
        </div>
      </div>
    </div>
  );
}
