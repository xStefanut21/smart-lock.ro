'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Option {
  id: string;
  name: string;
  values: OptionValue[];
}

interface OptionValue {
  id: string;
  option_id: string;
  name: string;
  image_url?: string;
  sort_order: number;
  price_modifier: number;
}

interface ProductOption {
  id: string;
  product_id: string;
  option_id: string;
  required: boolean;
  default_value_id?: string;
  price_modifier: number;
}

interface SelectedOption {
  option_id: string;
  value_ids: string[]; // Array of selected value IDs
  price_modifier: number;
  required: boolean;
}

interface ProductOptionsManagerProps {
  productId: string;
  selectedOptions: SelectedOption[];
  onOptionsChange: (options: SelectedOption[]) => void;
  priceModifiers?: Record<string, number>; // Local price modifiers state
  onPriceModifiersChange?: (modifiers: Record<string, number>) => void; // Callback to update parent
  className?: string;
}

export default function ProductOptionsManager({
  productId,
  selectedOptions,
  onOptionsChange,
  priceModifiers = {},
  onPriceModifiersChange,
  className = ""
}: ProductOptionsManagerProps) {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<Option[]>([]);
  // Local state for input values to have full control
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  console.log('ProductOptionsManager received:', { selectedOptions, priceModifiers });

  useEffect(() => {
    async function fetchOptions() {
      try {
        const supabase = createSupabaseBrowserClient();

        // Fetch all options with their values
        const { data: optionsData } = await supabase
          .from('options')
          .select(`
            id,
            name,
            option_values (
              id,
              option_id,
              name,
              image_url,
              sort_order,
              price_modifier
            )
          `)
          .order('name');

        if (optionsData) {
          const formattedOptions = optionsData.map((opt: any) => ({
            id: opt.id,
            name: opt.name,
            values: opt.option_values.sort((a: any, b: any) => a.sort_order - b.sort_order)
          }));
          setOptions(formattedOptions);
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOptions();
  }, []);

  function handleOptionChange(optionId: string, valueIds: string) {
    // Parse the comma-separated value IDs
    const selectedValueIds = valueIds ? valueIds.split(',').filter(id => id.trim()) : [];
    
    const newOptions = selectedOptions.filter((o: SelectedOption) => o.option_id !== optionId);
    
    if (selectedValueIds.length > 0) {
      newOptions.push({
        option_id: optionId,
        value_ids: selectedValueIds,
        price_modifier: 0, // Will be managed separately
        required: false
      });
    }
    
    onOptionsChange(newOptions);
  }

  function getOptionValue(optionId: string): string[] {
    const selected = selectedOptions.find((o: SelectedOption) => o.option_id === optionId);
    return selected?.value_ids || [];
  }

  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-neutral-700 rounded mb-4"></div>
          <div className="h-4 bg-neutral-700 rounded mb-2"></div>
          <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Opțiuni Produs</h3>
      
      {options.length === 0 ? (
        <p className="text-neutral-400">Nu există opțiuni disponibile. Adaugă mai întâi opțiuni în secțiunea Opțiuni.</p>
      ) : (
        // Always show all available options
        <div className="space-y-6">
          <p className="text-sm text-neutral-400 mb-4">
            Bifează opțiunile pe care vrei să le activezi pentru acest produs. Pentru fiecare opțiune bifată poți selecta valorile individuale și seta modificatori de preț.
          </p>
          {options.map((opt) => {
            const isSelected = selectedOptions.some(so => so.option_id === opt.id);
            const currentSelectedOption = selectedOptions.find(so => so.option_id === opt.id);
            const isRequired = currentSelectedOption?.required || false; // Use from selectedOptions instead
            const currentValue = getOptionValue(opt.id);
            
            return (
              <div key={opt.id} className="border border-neutral-600 rounded-lg p-4 bg-neutral-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-200">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Add this option with all its values selected
                          const newOption: SelectedOption = {
                            option_id: opt.id,
                            value_ids: opt.values.map(v => v.id), // Select all values initially
                            price_modifier: 0,
                            required: false
                          };
                          onOptionsChange([...selectedOptions, newOption]);
                        } else {
                          // Remove this option
                          onOptionsChange(selectedOptions.filter(so => so.option_id !== opt.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-500 border-neutral-500 focus:ring-blue-500 bg-neutral-700"
                    />
                    <span>{opt.name}</span>
                    {isRequired && <span className="text-red-400">*</span>}
                  </div>
                </div>

                {/* Show values when option is selected */}
                {isSelected && (
                  <div className="space-y-2">
                    {(!opt || opt.values.length === 0) ? (
                      <p className="text-gray-500 text-sm italic">Nu există valori pentru această opțiune</p>
                    ) : (
                      <div className="space-y-2">
                        {opt.values.map((value: OptionValue) => (
                          <div key={value.id} className="flex items-center justify-between p-3 border rounded-lg bg-neutral-600/50 hover:bg-neutral-600 transition-colors">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={currentValue.includes(value.id)}
                                onChange={(e) => {
                                  const currentSelectedOption = selectedOptions.find(o => o.option_id === opt.id);
                                  const currentValues = currentSelectedOption?.value_ids || [];
                                  
                                  let newValues: string[];
                                  if (e.target.checked) {
                                    // Add value
                                    newValues = [...currentValues, value.id];
                                  } else {
                                    // Remove value
                                    newValues = currentValues.filter(v => v !== value.id);
                                  }
                                  
                                  handleOptionChange(opt.id, newValues.join(','));
                                }}
                                className="w-4 h-4 text-blue-500 border-neutral-500 focus:ring-blue-500 bg-neutral-700"
                              />
                              {value.image_url && (
                                <img 
                                  src={value.image_url} 
                                  alt={value.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              )}
                              <span className="font-medium text-neutral-100">
                                {value.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="0.00"
                                  value={inputValues[value.id] !== undefined ? inputValues[value.id] : (priceModifiers[value.id] === null ? '' : (priceModifiers[value.id] !== undefined ? priceModifiers[value.id] : (value.price_modifier || '')))}
                                  onChange={(e) => {
                                    const newValue = e.target.value;
                                    // Allow any input, including empty string and "-"
                                    setInputValues(prev => ({ ...prev, [value.id]: newValue }));
                                  }}
                                  onBlur={(e) => {
                                    const inputValue = inputValues[value.id] || '';
                                    
                                    // Always clear the input value state first
                                    setInputValues(prev => {
                                      const newValues = { ...prev };
                                      delete newValues[value.id];
                                      return newValues;
                                    });
                                    
                                    // Update price modifiers based on input value
                                    if (inputValue === '') {
                                      // Set to null to indicate cleared value
                                      const newModifiers = { ...priceModifiers, [value.id]: null };
                                      onPriceModifiersChange?.(newModifiers);
                                    } else {
                                      const newModifier = parseFloat(inputValue);
                                      if (!isNaN(newModifier)) {
                                        const newModifiers = { ...priceModifiers, [value.id]: newModifier };
                                        onPriceModifiersChange?.(newModifiers);
                                      }
                                    }
                                  }}
                                  className="w-20 px-2 py-1 text-sm border border-neutral-500 rounded bg-neutral-700 text-neutral-100 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                />
                                <span className="text-sm text-neutral-400">RON</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
