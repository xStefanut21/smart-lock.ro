"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface BrandFormData {
  name: string;
  description: string;
  logo_url: string;
  website_url: string;
  is_active: boolean;
  sort_order: number;
}

export default function AdminBrandsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
    logo_url: '',
    website_url: '',
    is_active: true,
    sort_order: 0
  });

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check admin authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.replace("/login?redirect=/admin/brands");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile || profile.is_admin !== true) {
        router.replace("/");
        return;
      }

      // Load brands
      const { data: brandsData, error: brandsError } = await supabase
        .from("brands")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (brandsError) {
        setError("Eroare la încărcarea brand-urilor: " + brandsError.message);
      } else {
        setBrands(brandsData || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Eroare neașteptată la încărcarea datelor");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setEditingBrand(brand.id);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo_url: brand.logo_url || '',
      website_url: brand.website_url || '',
      is_active: brand.is_active,
      sort_order: brand.sort_order
    });
    setError(null);
    setSuccess(null);
  };

  const handleAdd = () => {
    setSelectedBrand(null);
    setEditingBrand(null);
    setFormData({
      name: '',
      description: '',
      logo_url: '',
      website_url: '',
      is_active: true,
      sort_order: 0
    });
    setShowAddForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setSelectedBrand(null);
    setEditingBrand(null);
    setShowAddForm(false);
    setFormData({
      name: '',
      description: '',
      logo_url: '',
      website_url: '',
      is_active: true,
      sort_order: 0
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Numele brand-ului este obligatoriu");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingBrand) {
        // Update existing brand
        const { error } = await supabase
          .from("brands")
          .update({
            name: formData.name.trim(),
            description: formData.description || null,
            logo_url: formData.logo_url || null,
            website_url: formData.website_url || null,
            is_active: formData.is_active,
            sort_order: formData.sort_order,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingBrand);

        if (error) {
          setError("Eroare la actualizarea brand-ului: " + error.message);
        } else {
          setSuccess("Brand-ul a fost actualizat cu succes!");
          await loadData();
          handleCancel();
        }
      } else {
        // Create new brand
        const { error } = await supabase
          .from("brands")
          .insert({
            name: formData.name.trim(),
            description: formData.description || null,
            logo_url: formData.logo_url || null,
            website_url: formData.website_url || null,
            is_active: formData.is_active,
            sort_order: formData.sort_order
          });

        if (error) {
          setError("Eroare la crearea brand-ului: " + error.message);
        } else {
          setSuccess("Brand-ul a fost creat cu succes!");
          await loadData();
          handleCancel();
        }
      }
    } catch (error) {
      console.error("Error saving brand:", error);
      setError("Eroare neașteptată la salvare");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (!confirm(`Ești sigur că vrei să ștergi brand-ul "${brand.name}"? Această acțiune nu poate fi anulată.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", brand.id);

      if (error) {
        setError("Eroare la ștergerea brand-ului: " + error.message);
      } else {
        setSuccess("Brand-ul a fost șters cu succes!");
        await loadData();
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      setError("Eroare neașteptată la ștergere");
    }
  };

  const handleToggleActive = async (brand: Brand) => {
    try {
      const { error } = await supabase
        .from("brands")
        .update({
          is_active: !brand.is_active,
          updated_at: new Date().toISOString()
        })
        .eq("id", brand.id);

      if (error) {
        setError("Eroare la actualizarea statusului: " + error.message);
      } else {
        await loadData();
      }
    } catch (error) {
      console.error("Error toggling brand status:", error);
      setError("Eroare neașteptată");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă brand-urile...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-200">
      <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-lg font-semibold text-white">
              🏷️ Management Brand-uri
            </h1>
            <p className="text-xs text-neutral-400">
              Gestionează brand-urile din catalogul tău. Adaugă, modifică sau șterge brand-uri.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            + Adaugă Brand
          </button>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 rounded-md bg-red-900/50 border border-red-700 p-4">
          <div className="flex">
            <div className="text-sm text-red-200">{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-900/50 border border-green-700 p-4">
          <div className="flex">
            <div className="text-sm text-green-200">{success}</div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(editingBrand || showAddForm) && (
        <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            {editingBrand ? 'Editare Brand' : 'Adăugare Brand Nou'}
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-1">
                  Nume Brand *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: Smart Lock Pro"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-1">
                  Ordine Sortare
                </label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-200 mb-1">
                Descriere
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descriere opțională a brand-ului..."
                rows={3}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-1">
                  URL Logo
                </label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-200 mb-1">
                  Website Oficial
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder="https://brand-website.com"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-600 rounded bg-neutral-800"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-neutral-200">
                Brand activ (vizibil în catalog)
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="rounded-md bg-neutral-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-500 transition-colors"
              disabled={saving}
            >
              Anulare
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Se salvează...' : (editingBrand ? 'Actualizează Brand' : 'Creează Brand')}
            </button>
          </div>
        </div>
      )}

      {/* Brands List */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Brand-uri Existente</h2>

        {brands.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏷️</div>
            <h3 className="text-lg font-semibold text-white mb-2">Niciun brand adăugat</h3>
            <p className="text-neutral-400 mb-4">Începe prin adăugarea primului brand în catalog.</p>
            <button
              onClick={handleAdd}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              + Adaugă Primul Brand
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4 hover:bg-neutral-900/80 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-white">{brand.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${
                        brand.is_active
                          ? 'bg-green-900/50 text-green-200'
                          : 'bg-red-900/50 text-red-200'
                      }`}>
                        {brand.is_active ? 'Activ' : 'Inactiv'}
                      </span>
                    </div>

                    {brand.description && (
                      <p className="text-sm text-neutral-400 mb-2">{brand.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      {brand.website_url && (
                        <a
                          href={brand.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-400 transition-colors"
                        >
                          🌐 Website
                        </a>
                      )}
                      <span>Ordine: {brand.sort_order}</span>
                      <span>Creeat: {new Date(brand.created_at).toLocaleDateString('ro-RO')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(brand)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        brand.is_active
                          ? 'bg-red-600 hover:bg-red-500 text-white'
                          : 'bg-green-600 hover:bg-green-500 text-white'
                      }`}
                      title={brand.is_active ? 'Dezactivează' : 'Activează'}
                    >
                      {brand.is_active ? 'Dezactivează' : 'Activează'}
                    </button>

                    <button
                      onClick={() => handleEdit(brand)}
                      className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                    >
                      Editare
                    </button>

                    <button
                      onClick={() => handleDelete(brand)}
                      className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
