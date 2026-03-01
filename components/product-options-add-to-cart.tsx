"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface ProductOption {
  optionId: string;
  optionName: string;
  required: boolean;
  priceModifier: number;
  defaultValueId?: string;
}

interface OptionValue {
  id: string;
  name: string;
  sort_order: number;
}

interface ProductOptionsAddToCartProps {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  stockAvailable: boolean;
  productOptions: ProductOption[];
}

export function ProductOptionsAddToCart({
  productId,
  name,
  price,
  imageUrl,
  stockAvailable,
  productOptions,
}: ProductOptionsAddToCartProps) {
  console.log('ProductOptionsAddToCart component mounted!');
  
  const router = useRouter();
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [optionValues, setOptionValues] = useState<Record<string, OptionValue[]>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inCart, setInCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Debug log
  console.log('ProductOptionsAddToCart - productOptions:', productOptions);

  // Fetch values for all options
  useEffect(() => {
    async function fetchValues() {
      try {
        console.log('fetchValues called, productOptions:', productOptions);
        
        if (!productOptions || productOptions.length === 0) {
          console.log('No product options, setting loading to false');
          setLoading(false);
          return;
        }

        console.log('Fetching values for options:', productOptions);
        const supabase = createSupabaseBrowserClient();
        const optionIds = productOptions.map(po => po.optionId);

        const { data, error } = await supabase
          .from('option_values')
          .select('id, name, sort_order, option_id')
          .in('option_id', optionIds)
          .order('sort_order');

        console.log('Fetched option values:', { data, error });

        if (error) throw error;

        const valuesByOption: Record<string, OptionValue[]> = {};
        data?.forEach(val => {
          if (!valuesByOption[val.option_id]) {
            valuesByOption[val.option_id] = [];
          }
          valuesByOption[val.option_id].push({
            id: val.id,
            name: val.name,
            sort_order: val.sort_order
          });
        });

        console.log('Setting option values:', valuesByOption);
        setOptionValues(valuesByOption);

        // Set defaults
        const defaults: Record<string, string> = {};
        productOptions.forEach(po => {
          if (po.defaultValueId) {
            defaults[po.optionId] = po.defaultValueId;
          }
        });
        setSelectedValues(defaults);
      } catch (err) {
        console.error('Error fetching option values:', err);
        setError('Failed to load options');
      } finally {
        setLoading(false);
      }
    }

    fetchValues();
  }, [productOptions]);

  // Check if in cart
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("cart");
      if (!raw) {
        setInCart(false);
        return;
      }
      const cart = JSON.parse(raw) as any[];
      const exists = cart.some(item => {
        if (item.id !== productId) return false;
        if (!item.options || item.options.length !== productOptions.length) return false;
        return item.options.every((opt: any) =>
          selectedValues[opt.optionId] === opt.valueId
        );
      });
      setInCart(exists);
    } catch {
      setInCart(false);
    }
  }, [productId, selectedValues, productOptions]);

  const totalPrice = price + Object.entries(selectedValues).reduce((sum, [optionId, valueId]) => {
    const option = productOptions.find(o => o.optionId === optionId);
    if (!option || !valueId) return sum; // Nu adăugăm modificator dacă nu e selectată valoarea
    const value = optionValues[optionId]?.find(v => v.id === valueId);
    return sum + (option.priceModifier || 0);
  }, 0);

  function handleAdd() {
    if (!stockAvailable) return;

    // Check required options
    const missingRequired = productOptions.filter(po =>
      po.required && !selectedValues[po.optionId]
    );

    if (missingRequired.length > 0) {
      setError(`Te rog completează toate opțiunile obligatorii: ${missingRequired.map(po => po.optionName).join(', ')}`);
      return;
    }

    setError(null);

    const raw = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
    const cart = raw ? JSON.parse(raw) : [];

    const options = Object.entries(selectedValues).map(([optionId, valueId]) => {
      const option = productOptions.find(o => o.optionId === optionId)!;
      const value = optionValues[optionId]?.find(v => v.id === valueId)!;
      return {
        optionId,
        optionName: option.optionName,
        valueId,
        valueName: value?.name || '',
        priceModifier: option.priceModifier
      };
    });

    const qty = quantity && quantity > 0 ? quantity : 1;

    const existing = cart.find((item: any) =>
      item.id === productId &&
      item.options &&
      item.options.length === options.length &&
      item.options.every((opt: any, idx: number) =>
        opt.optionId === options[idx].optionId && opt.valueId === options[idx].valueId
      )
    );

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.push({
        id: productId,
        name,
        basePrice: price,
        price: totalPrice,
        quantity: qty,
        image: imageUrl ?? null,
        options,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "cart", newValue: JSON.stringify(cart) })
      );
    }

    setInCart(true);
    setShowConfirm(true);
  }

  if (loading) {
    return <div className="mt-3 text-sm text-neutral-400">Se încarcă opțiunile...</div>;
  }

  if (!stockAvailable) {
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
    <div className="mt-3 space-y-3">
      {productOptions.map((option) => (
        <div key={option.optionId} className="space-y-2">
          <label className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
            {option.optionName} {option.required && <span className="text-red-400">*</span>}
          </label>
          <div className="space-y-1">
            {(optionValues[option.optionId] || []).map((value) => (
              <label
                key={value.id}
                className={`
                  flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors
                  ${selectedValues[option.optionId] === value.id
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-neutral-700 bg-neutral-900/50 text-neutral-300 hover:border-neutral-600'
                  }
                `}
              >
                <input
                  type="radio"
                  name={`option-${option.optionId}`}
                  value={value.id}
                  checked={selectedValues[option.optionId] === value.id}
                  onChange={(e) => setSelectedValues(prev => ({ ...prev, [option.optionId]: e.target.value }))}
                  className="w-4 h-4 text-blue-500 border-neutral-600 bg-neutral-800 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">{value.name}</span>
                {option.priceModifier !== 0 && (
                  <span className={`text-xs ml-auto ${option.priceModifier > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {option.priceModifier > 0 ? '+' : ''}{option.priceModifier} RON
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="text-sm font-medium text-white pt-2 border-t border-neutral-800">
        Preț total: {totalPrice.toFixed(2)} RON
      </div>

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      <div className="flex items-stretch gap-2">
        <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900 text-xs">
          <button
            type="button"
            onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
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
            onClick={() => setQuantity((prev) => prev + 1)}
            className="flex h-8 w-8 items-center justify-center border-l border-neutral-700 text-neutral-200 hover:bg-neutral-800"
            aria-label="Crește cantitatea"
          >
            +
          </button>
        </div>

        <div className="flex-1">
          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-md bg-blue-600 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            {inCart ? "În coș" : "Adaugă în coș"}
          </button>
        </div>
      </div>

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
