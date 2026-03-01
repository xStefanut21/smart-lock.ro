"use client";

import { useState, useEffect } from "react";
import { AddToCartButton } from "./add-to-cart-button";
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
  image_url?: string;
  price_modifier: number;
}

interface ProductAddToCartWithInstallationProps {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  stockAvailable: boolean;
  hasInstallationOption: boolean;
  installationPrice: number | null;
  productOptions?: ProductOption[];
}

export function ProductAddToCartWithInstallation({
  productId,
  name,
  price,
  imageUrl,
  stockAvailable,
  hasInstallationOption,
  installationPrice,
  productOptions,
}: ProductAddToCartWithInstallationProps) {
  const [withInstallation, setWithInstallation] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [optionValues, setOptionValues] = useState<Record<string, OptionValue[]>>({});
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // Fetch option values separately
  useEffect(() => {
    async function fetchValues() {
      if (!productOptions || productOptions.length === 0) {
        setLoading(false);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const optionIds = productOptions.map(po => po.optionId);

      try {
        // Fetch selected values for this product
        const { data: selectedValuesData } = await supabase
          .from('product_selected_values')
          .select('option_id, value_id, option_values!left(id, name, sort_order, image_url, price_modifier)')
          .eq('product_id', productId)
          .in('option_id', optionIds);

        if (selectedValuesData) {
          const valuesByOption: Record<string, OptionValue[]> = {};
          selectedValuesData.forEach((svd: any) => {
            if (!valuesByOption[svd.option_id]) {
              valuesByOption[svd.option_id] = [];
            }
            if (svd.option_values) {
              valuesByOption[svd.option_id].push({
                id: svd.option_values.id,
                name: svd.option_values.name,
                sort_order: svd.option_values.sort_order,
                image_url: svd.option_values.image_url,
                price_modifier: svd.option_values.price_modifier || 0
              });
            }
          });
          
          // Sort values by sort_order
          Object.keys(valuesByOption).forEach(optionId => {
            valuesByOption[optionId].sort((a: OptionValue, b: OptionValue) => a.sort_order - b.sort_order);
          });
          
          setOptionValues(valuesByOption);
        }

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
      } finally {
        setLoading(false);
      }
    }

    fetchValues();
  }, [productOptions, productId]);

  // Calculate total price
  const basePrice = price;
  const installationCost = withInstallation && installationPrice ? installationPrice : 0;
  const optionsCost = Object.entries(selectedValues).reduce((sum, [optionId, valueId]) => {
    if (!valueId) return sum;
    // Find the selected value for this option
    const selectedValue = optionValues[optionId]?.find(v => v.id === valueId);
    return sum + (selectedValue?.price_modifier || 0);
  }, 0);
  const totalPrice = basePrice + installationCost + optionsCost;

  const handleOptionChange = (optionId: string, valueId: string) => {
    setSelectedValues(prev => ({ ...prev, [optionId]: valueId }));
  };

  return (
    <div className="space-y-4">
      {/* Installation Options */}
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
        
      {/* Product Options */}
      {productOptions && productOptions.length > 0 && (
        <div className="space-y-3">
          {productOptions.map((option) => {
            // Deduplicate values by ID to prevent React key errors
            const uniqueValues = (optionValues[option.optionId] || []).filter((value: OptionValue, index: number, arr: OptionValue[]) => 
              arr.findIndex((v: OptionValue) => v.id === value.id) === index
            );
            
            return (
              <div key={option.optionId} className="rounded-md border border-neutral-800 bg-neutral-950/60 p-3">
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-neutral-300">
                  {option.optionName} {option.required && <span className="text-red-400">*</span>}
                </label>
                <div className="space-y-2">
                  {uniqueValues.map((value: OptionValue) => (
                    <label key={value.id} className="flex items-center justify-between gap-2 cursor-pointer rounded-md border border-neutral-700 bg-neutral-900 p-2 hover:border-neutral-600">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`option-${option.optionId}`}
                          checked={selectedValues[option.optionId] === value.id}
                          onChange={() => handleOptionChange(option.optionId, value.id)}
                          className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600"
                        />
                        <span className="text-sm text-neutral-200">{value.name}</span>
                      </div>
                      {value.price_modifier !== 0 && (
                        <span className={`text-sm font-medium ${
                          value.price_modifier > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {value.price_modifier > 0 ? '+' : ''}{value.price_modifier} RON
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
        
      {/* Price Summary */}
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
          {optionsCost !== 0 && (
            <div className="flex justify-between">
              <span>Opțiuni:</span>
              <span>{new Intl.NumberFormat("ro-RO", {
                style: "currency",
                currency: "RON",
              }).format(optionsCost)}</span>
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

      {/* Quantity and Add to Cart */}
      <div className="flex items-stretch gap-2">
        <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900 text-xs">
          <button
            type="button"
            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
            className="flex h-8 w-8 items-center justify-center border-r border-neutral-700 text-neutral-200 hover:bg-neutral-800"
          >
            −
          </button>
          <div className="flex h-8 min-w-[2.5rem] items-center justify-center px-2 text-sm font-medium text-white">
            {quantity}
          </div>
          <button
            type="button"
            onClick={() => setQuantity(prev => prev + 1)}
            className="flex h-8 w-8 items-center justify-center border-l border-neutral-700 text-neutral-200 hover:bg-neutral-800"
          >
            +
          </button>
        </div>

        <div className="flex-1">
          <AddToCartButton
            productId={productId}
            name={name}
            price={totalPrice}
            imageUrl={imageUrl}
            disabled={!stockAvailable}
            quantity={quantity}
            hasInstallation={withInstallation}
            installationPrice={withInstallation ? (installationPrice || 0) : 0}
            selectedOptions={selectedValues}
          />
        </div>
      </div>
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
