"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Option = {
  id: string;
  name: string;
  values: OptionValue[];
};

type OptionValue = {
  id: string;
  option_id: string;
  name: string;
  image_url?: string;
  sort_order: number;
};

export default function AdminOptionsPage() {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<Option[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [newOptionName, setNewOptionName] = useState("");
  const [editingName, setEditingName] = useState("");
  const [currentOption, setCurrentOption] = useState<Option | null>(null);
  const [valueForm, setValueForm] = useState({ name: "", image: undefined as File | undefined, sort_order: 0 });
  const [editingValue, setEditingValue] = useState<OptionValue | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, OptionValue | null>>({});
  const [valueForms, setValueForms] = useState<Record<string, { name: string; image: File | undefined; sort_order: number }>>({});

  useEffect(() => {
    fetchOptions();
  }, []);

  async function fetchOptions() {
    try {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();

      const { data: optionsData, error: optionsError } = await supabase
        .from('options')
        .select('*')
        .order('name');

      if (optionsError) throw optionsError;

      const optionsWithValues = await Promise.all(
        optionsData.map(async (option) => {
          const { data: valuesData } = await supabase
            .from('option_values')
            .select('*')
            .eq('option_id', option.id)
            .order('sort_order');

          return {
            ...option,
            values: valuesData || []
          };
        })
      );

      setOptions(optionsWithValues);
    } catch (err) {
      console.error('Error fetching options:', err);
      setError('Eroare la încărcarea opțiunilor');
    } finally {
      setLoading(false);
    }
  }

  async function addOption() {
    if (!newOptionName.trim()) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('options')
        .insert({ name: newOptionName.trim() });

      if (error) throw error;

      alert('Opțiune adăugată cu succes');
      setNewOptionName("");
      fetchOptions();
    } catch (err) {
      console.error('Error adding option:', err);
      alert('Eroare la adăugarea opțiunii');
    }
  }

  async function deleteOption(optionId: string) {
    if (!confirm('Sigur doriți să ștergeți această opțiune?')) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('options')
        .delete()
        .eq('id', optionId);

      if (error) throw error;

      alert('Opțiune ștearsă cu succes');
      fetchOptions();
    } catch (err) {
      console.error('Error deleting option:', err);
      alert('Eroare la ștergerea opțiunii');
    }
  }

  async function updateOption(optionId: string, name: string) {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('options')
        .update({ name })
        .eq('id', optionId);

      if (error) throw error;

      alert('Opțiune actualizată');
      fetchOptions();
    } catch (err) {
      console.error('Error updating option:', err);
      alert('Eroare la actualizarea opțiunii');
    }
  }

  async function addValue(optionId: string, valueData: { name: string; image?: File; sort_order: number }) {
    try {
      const supabase = createSupabaseBrowserClient();
      let imageUrl = undefined;

      if (valueData.image) {
        const fileExt = valueData.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `option-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, valueData.image);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('option_values')
        .insert({
          option_id: optionId,
          name: valueData.name,
          image_url: imageUrl,
          sort_order: valueData.sort_order
        });

      if (error) throw error;

      alert('Valoare adăugată cu succes');
      fetchOptions();
    } catch (err) {
      console.error('Error adding value:', err);
      alert('Eroare la adăugarea valorii');
    }
  }

  async function updateValue(valueId: string, valueData: { name?: string; image?: File; sort_order?: number }) {
    try {
      const supabase = createSupabaseBrowserClient();
      let imageUrl = undefined;

      if (valueData.image) {
        const fileExt = valueData.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `option-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(filePath, valueData.image);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const updateData: any = {};
      if (valueData.name !== undefined) updateData.name = valueData.name;
      if (imageUrl !== undefined) updateData.image_url = imageUrl;
      if (valueData.sort_order !== undefined) updateData.sort_order = valueData.sort_order;

      const { error } = await supabase
        .from('option_values')
        .update(updateData)
        .eq('id', valueId);

      if (error) throw error;

      alert('Valoare actualizată cu succes');
      fetchOptions();
    } catch (err) {
      console.error('Error updating value:', err);
      alert('Eroare la actualizarea valorii');
    }
  }

  async function deleteValue(valueId: string) {
    if (!confirm('Sigur doriți să ștergeți această valoare?')) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('option_values')
        .delete()
        .eq('id', valueId);

      if (error) throw error;

      alert('Valoare ștearsă cu succes');
      fetchOptions();
    } catch (err) {
      console.error('Error deleting value:', err);
      alert('Eroare la ștergerea valorii');
    }
  }

  if (loading) {
    return <div className="p-6">Se încarcă...</div>;
  }

  return (
  <div className="p-8 bg-neutral-900 min-h-screen">
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">🔧 Administrare Opțiuni Produse</h1>
        <p className="text-neutral-400">Gestionează opțiunile disponibile pentru produsele din catalog</p>
      </div>

      {/* Add new option form */}
      <div className="bg-neutral-800 rounded-lg p-6 mb-8 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          ➕ Adăugare Opțiune Nouă
        </h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-300 mb-2">Nume Opțiune</label>
            <input
              type="text"
              value={newOptionName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewOptionName(e.target.value)}
              placeholder="Ex: Mărime, Material, Culoare"
              className="w-full p-3 border border-neutral-600 rounded-lg bg-neutral-700 text-white placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={addOption}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <span>+</span> Adaugă
          </button>
        </div>
      </div>

      {/* Options list */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <div key={option.id} className="bg-neutral-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
              <input
                type="text"
                value={editingOption?.id === option.id ? editingName : option.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingName(e.target.value)}
                onFocus={() => { setEditingOption(option); setEditingName(option.name); }}
                onBlur={() => { if (editingOption?.id === option.id) updateOption(option.id, editingName); setEditingOption(null); }}
                className="text-xl font-semibold bg-transparent border-none outline-none text-white w-full"
              />
              <button
                onClick={() => deleteOption(option.id)}
                className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                title="Șterge opțiune"
              >
                🗑️
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-neutral-300">Valori:</h4>
                <span className="text-sm text-neutral-500">{option.values.length} valori</span>
              </div>
              {option.values.length === 0 ? (
                <p className="text-neutral-500 italic">Nicio valoare adăugată</p>
              ) : (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {option.values.map((value) => (
                    <div key={value.id} className="bg-neutral-700 rounded p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {value.image_url && <img src={value.image_url} alt={value.name} className="w-6 h-6 object-cover rounded" />}
                        <span className="text-white text-sm">{value.name}</span>
                        <span className="text-neutral-500 text-xs">(#{value.sort_order})</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { 
                            const currentEditingValue = editingValues[option.id];
                            setEditingValues(prev => ({ ...prev, [option.id]: value }));
                            setValueForms(prev => ({ ...prev, [option.id]: { name: value.name, image: undefined, sort_order: value.sort_order } }));
                          }}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                          title="Editare"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteValue(value.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                          title="Șterge"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add/Edit value form */}
              <div className="border-t border-neutral-600 pt-3 mt-3">
                <h5 className="font-medium text-neutral-300 mb-3">
                  {editingValues[option.id] ? '✏️ Editare Valoare' : '➕ Adăugare Valoare Nouă'}
                </h5>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300 flex items-center gap-2">
                      <span>📝</span> Nume Valoare
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Mare, Alb, Metalic"
                      value={valueForms[option.id]?.name || ""}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setValueForms(prev => ({ ...prev, [option.id]: { ...prev[option.id], name: e.target.value } }))}
                      className="w-full p-3 border border-neutral-600 rounded-lg bg-neutral-700 text-white placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300 flex items-center gap-2">
                      <span>🖼️</span> Imagine (opțional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setValueForms(prev => ({ ...prev, [option.id]: { ...prev[option.id], image: e.target.files?.[0] || undefined } }))}
                        className="w-full p-3 border border-neutral-600 rounded-lg bg-neutral-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-neutral-600 file:text-white file:cursor-pointer cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none">
                        📁
                      </div>
                    </div>
                    {valueForms[option.id]?.image && (
                      <p className="text-xs text-green-400 flex items-center gap-1">
                        <span>✅</span> {valueForms[option.id]?.image?.name || 'Fisier selectat'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-300 flex items-center gap-2">
                      <span>🔢</span> Ordine Sortare
                    </label>
                    <input
                      type="number"
                      placeholder="0, 1, 2..."
                      value={valueForms[option.id]?.sort_order || 0}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setValueForms(prev => ({ ...prev, [option.id]: { ...prev[option.id], sort_order: parseInt(e.target.value) || 0 } }))}
                      className="w-full p-3 border border-neutral-600 rounded-lg bg-neutral-700 text-white placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      const currentEditingValue = editingValues[option.id];
                      if (currentEditingValue) {
                        updateValue(currentEditingValue.id, valueForms[option.id] || {});
                        setEditingValues(prev => {
                          const newValues = { ...prev };
                          delete newValues[option.id];
                          return newValues;
                        });
                        setValueForms(prev => {
                          const newForms = { ...prev };
                          delete newForms[option.id];
                          return newForms;
                        });
                      } else {
                        addValue(option.id, valueForms[option.id] || {});
                        setValueForms(prev => ({ ...prev, [option.id]: { name: "", image: undefined, sort_order: 0 } }));
                      }
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors duration-200"
                  >
                    {editingValues[option.id] ? '💾 Salvează' : '➕ Adaugă'}
                  </button>
                  {editingValues[option.id] && (
                    <button
                      onClick={() => {
                        setEditingValues(prev => {
                          const newValues = { ...prev };
                          delete newValues[option.id];
                          return newValues;
                        });
                        setValueForms(prev => {
                          const newForms = { ...prev };
                          delete newForms[option.id];
                          return newForms;
                        });
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors duration-200"
                    >
                      ❌ Anulează
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
}
