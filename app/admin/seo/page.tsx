"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface SEOSettings {
  id?: string;
  store_name: string;
  default_title_template: string;
  default_description_template: string;
  default_keywords_template: string;
  created_at?: string;
  updated_at?: string;
}

interface RedirectRule {
  id?: string;
  source_url: string;
  target_url: string;
  status_code: 301 | 302;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AdminSEOSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'redirects'>('settings');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // SEO Settings state
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    store_name: 'Smart Lock',
    default_title_template: 'Cumpără [product_name] la doar [price] RON în categoria [category] - [store_name]',
    default_description_template: 'Descoperă [product_name] de la [brand] la prețul de [price] RON. [short_description] Livrare rapidă în toată România.',
    default_keywords_template: '[product_name], [brand], [category], cumpărare online, [store_name]'
  });

  // Redirects state
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [showAddRedirect, setShowAddRedirect] = useState(false);
  const [newRedirect, setNewRedirect] = useState<Partial<RedirectRule>>({
    source_url: '',
    target_url: '',
    status_code: 301,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createSupabaseBrowserClient();

    try {
      // Check admin access
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?redirect=/admin/seo");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile || profile.is_admin !== true) {
        router.replace("/");
        return;
      }

      // Load SEO settings
      const { data: settings } = await supabase
        .from('seo_settings')
        .select('*')
        .single();

      if (settings) {
        setSeoSettings(settings);
      }

      // Load redirects
      const { data: redirectsData } = await supabase
        .from('seo_redirects')
        .select('*')
        .order('created_at', { ascending: false });

      setRedirects(redirectsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  }

  async function saveSEOSettings() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from('seo_settings')
        .upsert({
          ...seoSettings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSuccess('Setările SEO au fost salvate cu succes');
    } catch (error: any) {
      console.error('Error saving SEO settings:', error);
      setError(error.message || 'Eroare la salvarea setărilor');
    } finally {
      setSaving(false);
    }
  }

  async function saveRedirect() {
    if (!newRedirect.source_url?.trim() || !newRedirect.target_url?.trim()) {
      setError('URL-ul sursă și destinație sunt obligatorii');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from('seo_redirects')
        .upsert({
          ...newRedirect,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSuccess('Redirect-ul a fost salvat cu succes');
      setShowAddRedirect(false);
      setNewRedirect({
        source_url: '',
        target_url: '',
        status_code: 301,
        is_active: true
      });

      // Reload redirects
      await loadData();

    } catch (error: any) {
      console.error('Error saving redirect:', error);
      setError(error.message || 'Eroare la salvarea redirect-ului');
    } finally {
      setSaving(false);
    }
  }

  async function toggleRedirectStatus(redirect: RedirectRule) {
    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from('seo_redirects')
        .update({
          is_active: !redirect.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', redirect.id);

      if (error) throw error;

      setRedirects(prev => prev.map(r =>
        r.id === redirect.id ? { ...r, is_active: !r.is_active } : r
      ));

    } catch (error: any) {
      console.error('Error toggling redirect:', error);
      setError(error.message || 'Eroare la actualizarea redirect-ului');
    }
  }

  async function deleteRedirect(redirectId: string) {
    if (!confirm('Sigur vrei să ștergi acest redirect?')) return;

    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from('seo_redirects')
        .delete()
        .eq('id', redirectId);

      if (error) throw error;

      setRedirects(prev => prev.filter(r => r.id !== redirectId));
      setSuccess('Redirect-ul a fost șters cu succes');

    } catch (error: any) {
      console.error('Error deleting redirect:', error);
      setError(error.message || 'Eroare la ștergerea redirect-ului');
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă setările SEO...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-200">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-xs text-neutral-400 hover:text-white"
      >
        ← Înapoi
      </button>

      <div className="mb-6">
        <h1 className="text-lg font-semibold text-white">Administrare SEO</h1>
        <p className="text-xs text-neutral-400">
          Configurează setările SEO, șabloane și redirect-uri pentru optimizarea căutării.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-neutral-800">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-300'
            }`}
          >
            Setări SEO
          </button>
          <button
            onClick={() => setActiveTab('redirects')}
            className={`pb-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'redirects'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-300'
            }`}
          >
            Redirect-uri
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {success && (
        <p className="mb-4 rounded-md border border-green-700 bg-green-950/40 px-3 py-2 text-xs text-green-300">
          {success}
        </p>
      )}

      {/* SEO Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
            <h2 className="mb-4 text-base font-semibold text-white">Setări Generale</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Numele Magazinului
                </label>
                <input
                  type="text"
                  value={seoSettings.store_name}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, store_name: e.target.value }))}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500"
                  placeholder="ex: Smart Lock"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Folosit în șabloane cu variabila [store_name]
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
            <h2 className="mb-4 text-base font-semibold text-white">Șabloane Metadata</h2>
            <p className="mb-4 text-xs text-neutral-400">
              Variabile disponibile: [product_name], [price], [category], [brand], [store_name], [short_description]
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Șablon Titlu (Title)
                </label>
                <textarea
                  value={seoSettings.default_title_template}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, default_title_template: e.target.value }))}
                  rows={2}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Șablon Descriere (Description)
                </label>
                <textarea
                  value={seoSettings.default_description_template}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, default_description_template: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Șablon Cuvinte Cheie (Keywords)
                </label>
                <textarea
                  value={seoSettings.default_keywords_template}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, default_keywords_template: e.target.value }))}
                  rows={2}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveSEOSettings}
              disabled={saving}
              className="rounded-md bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Se salvează...' : 'Salvează Setările'}
            </button>
          </div>
        </div>
      )}

      {/* Redirects Tab */}
      {activeTab === 'redirects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-white">Redirect-uri SEO</h2>
            <button
              onClick={() => setShowAddRedirect(true)}
              className="rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-500"
            >
              + Adaugă Redirect
            </button>
          </div>

          {/* Add Redirect Form */}
          {showAddRedirect && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
              <h3 className="mb-4 text-sm font-semibold text-white">Adaugă Redirect Nou</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    URL Sursă *
                  </label>
                  <input
                    type="text"
                    value={newRedirect.source_url}
                    onChange={(e) => setNewRedirect(prev => ({ ...prev, source_url: e.target.value }))}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500"
                    placeholder="/produs-vechi"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    URL Destinație *
                  </label>
                  <input
                    type="text"
                    value={newRedirect.target_url}
                    onChange={(e) => setNewRedirect(prev => ({ ...prev, target_url: e.target.value }))}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500"
                    placeholder="/produs-nou"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Cod Status
                  </label>
                  <select
                    value={newRedirect.status_code}
                    onChange={(e) => setNewRedirect(prev => ({ ...prev, status_code: parseInt(e.target.value) as 301 | 302 }))}
                    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-red-500"
                  >
                    <option value={301}>301 - Permanent</option>
                    <option value={302}>302 - Temporary</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={newRedirect.is_active}
                    onChange={(e) => setNewRedirect(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-xs text-neutral-300">
                    Activ
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddRedirect(false);
                    setNewRedirect({
                      source_url: '',
                      target_url: '',
                      status_code: 301,
                      is_active: true
                    });
                  }}
                  className="rounded-md border border-neutral-700 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800"
                >
                  Anulează
                </button>
                <button
                  onClick={saveRedirect}
                  disabled={saving}
                  className="rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Se salvează...' : 'Salvează'}
                </button>
              </div>
            </div>
          )}

          {/* Redirects List */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs text-neutral-300">
                <thead className="border-b border-neutral-800 bg-neutral-950/80 text-neutral-400">
                  <tr>
                    <th className="px-4 py-3">URL Sursă</th>
                    <th className="px-4 py-3">URL Destinație</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Activ</th>
                    <th className="px-4 py-3 text-right">Acțiuni</th>
                  </tr>
                </thead>
                <tbody>
                  {redirects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                        Nu există redirect-uri configurate
                      </td>
                    </tr>
                  ) : (
                    redirects.map((redirect) => (
                      <tr key={redirect.id} className="border-t border-neutral-900/80 hover:bg-neutral-900/60">
                        <td className="px-4 py-3 font-mono text-[11px] break-all">
                          {redirect.source_url}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] break-all">
                          {redirect.target_url}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded px-2 py-0.5 text-[10px] ${
                            redirect.status_code === 301
                              ? 'bg-green-900/40 text-green-300'
                              : 'bg-yellow-900/40 text-yellow-300'
                          }`}>
                            {redirect.status_code}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleRedirectStatus(redirect)}
                            className={`rounded px-2 py-0.5 text-[10px] ${
                              redirect.is_active
                                ? 'bg-green-900/40 text-green-300'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {redirect.is_active ? 'Activ' : 'Inactiv'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteRedirect(redirect.id!)}
                            className="rounded-full border border-red-700 p-1 text-[11px] text-red-400 hover:bg-red-900/40"
                            title="Șterge redirect"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
