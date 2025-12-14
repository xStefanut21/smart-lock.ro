"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number | null;
  is_active: boolean | null;
}

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/admin/categories");
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

      setCheckingAuth(false);

      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, image_url, sort_order, is_active")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) {
        setError("Nu am putut încărca categoriile. Încearcă din nou.");
        setLoading(false);
        return;
      }

      setCategories((data as Category[]) ?? []);
      setLoading(false);
    }

    init();
  }, [router]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setSlug("");
    setImageUrl("");
    setImageFile(null);
    setSortOrder("");
    setIsActive(true);
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setImageUrl(cat.image_url ?? "");
    setImageFile(null);
    setSortOrder(
      typeof cat.sort_order === "number" && !Number.isNaN(cat.sort_order)
        ? String(cat.sort_order)
        : ""
    );
    setIsActive(cat.is_active !== false);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    const supabase = createSupabaseBrowserClient();

    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();

    if (!trimmedName || !trimmedSlug) {
      setError("Numele și slug-ul categoriei sunt obligatorii.");
      setSaving(false);
      return;
    }

    let finalImageUrl = imageUrl.trim() || null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("category-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        setError(
          `Nu am putut încărca imaginea categoriei: ${uploadError.message || "eroare necunoscută"}`
        );
        setSaving(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("category-images").getPublicUrl(filePath);

      finalImageUrl = publicUrl || null;
    }

    const numericSortOrder = sortOrder.trim() ? Number(sortOrder.trim()) : null;
    if (numericSortOrder !== null && Number.isNaN(numericSortOrder)) {
      setError("Te rog introdu o valoare numerică pentru ordinea de sortare.");
      setSaving(false);
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("categories")
        .update({
          name: trimmedName,
          slug: trimmedSlug,
          image_url: finalImageUrl,
          sort_order: numericSortOrder,
          is_active: isActive,
        })
        .eq("id", editingId);

      if (error) {
        setError(error.message || "Nu am putut salva categoria.");
        setSaving(false);
        return;
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                name: trimmedName,
                slug: trimmedSlug,
                image_url: finalImageUrl,
                sort_order: numericSortOrder,
                is_active: isActive,
              }
            : c
        )
      );
      setSuccess("Categoria a fost actualizată.");
    } else {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: trimmedName,
          slug: trimmedSlug,
          image_url: finalImageUrl,
          sort_order: numericSortOrder,
          is_active: isActive,
        })
        .select("id, name, slug, image_url, sort_order, is_active")
        .maybeSingle<Category>();

      if (error || !data) {
        setError(error?.message || "Nu am putut crea categoria.");
        setSaving(false);
        return;
      }

      setCategories((prev) => [...prev, data]);
      setSuccess("Categoria a fost creată.");
    }

    setSaving(false);
    resetForm();
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Sigur vrei să ștergi categoria "${cat.name}"?`)) return;

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", cat.id);

    if (error) {
      setError(error.message || "Nu am putut șterge categoria.");
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    setSuccess("Categoria a fost ștearsă.");

    if (editingId === cat.id) {
      resetForm();
    }
  }

  if (checkingAuth) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
        Se verifică drepturile de administrator...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-xs text-neutral-400 hover:text-white"
      >
        ← Înapoi la panoul de administrare
      </button>

      <h1 className="mb-2 text-2xl font-semibold text-white">Administrare categorii produse</h1>
      <p className="mb-4 text-xs text-neutral-400">
        Adaugă, editează și șterge categoriile folosite pentru filtrarea produselor. Imaginile
        vor fi afișate ca butoane de categorii pe pagina de produse.
      </p>

      {error && (
        <div className="mb-3 rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 rounded-md border border-emerald-700 bg-emerald-950/30 px-3 py-2 text-xs text-emerald-200">
          {success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)]">
        {/* Formular categorie */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-xs">
          <h2 className="mb-3 text-sm font-semibold text-white">
            {editingId ? "Editează categoria" : "Adaugă categorie nouă"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-neutral-300" htmlFor="cat-name">
                Nume categorie
              </label>
              <input
                id="cat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-neutral-300" htmlFor="cat-slug">
                Slug (pentru URL / filtrare)
              </label>
              <input
                id="cat-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
              />
              <p className="text-[11px] text-neutral-500">
                Exemplu: ingropate, tip-cilindru, aplicate, accesorii.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-neutral-300" htmlFor="cat-image-url">
                URL imagine categorie (opțional)
              </label>
              <input
                id="cat-image-url"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
              />
              <p className="text-[11px] text-neutral-500">
                Poți folosi un link direct sau poți încărca un fișier mai jos.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-neutral-300" htmlFor="cat-image-file">
                Sau încarcă fișier imagine
              </label>
              <input
                id="cat-image-file"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100 outline-none file:mr-2 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1 file:text-xs file:text-neutral-100 focus:border-red-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-neutral-300" htmlFor="cat-sort-order">
                Ordine sortare (opțional)
              </label>
              <input
                id="cat-sort-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="h-9 max-w-[120px] rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
              />
              <p className="text-[11px] text-neutral-500">
                Categoriile vor fi afișate crescător după această valoare.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1 text-neutral-200">
              <input
                id="cat-active"
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600"
              />
              <label htmlFor="cat-active" className="text-xs text-neutral-300">
                Categorie activă (vizibilă în filtre)
              </label>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-red-600 px-5 py-2 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-60"
              >
                {saving
                  ? editingId
                    ? "Se salvează modificările..."
                    : "Se creează categoria..."
                  : editingId
                  ? "Salvează modificările"
                  : "Adaugă categoria"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[11px] text-neutral-400 hover:text-neutral-200"
                >
                  Anulează editarea
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Listă categorii */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-xs">
          <h2 className="mb-3 text-sm font-semibold text-white">Lista de categorii</h2>
          {loading ? (
            <p className="text-[11px] text-neutral-400">Se încarcă categoriile...</p>
          ) : categories.length === 0 ? (
            <p className="text-[11px] text-neutral-400">Nu există încă nicio categorie.</p>
          ) : (
            <ul className="space-y-2">
              {categories
                .slice()
                .sort((a, b) => {
                  const sa = typeof a.sort_order === "number" ? a.sort_order : 0;
                  const sb = typeof b.sort_order === "number" ? b.sort_order : 0;
                  if (sa !== sb) return sa - sb;
                  return a.name.localeCompare(b.name);
                })
                .map((cat) => (
                  <li
                    key={cat.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded border border-neutral-800 bg-black/40">
                        {cat.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cat.image_url}
                            alt={cat.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-[10px] text-neutral-500">Fără imagine</span>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-neutral-100">{cat.name}</p>
                        <p className="text-[11px] text-neutral-500">Slug: {cat.slug}</p>
                        <p className="text-[11px] text-neutral-500">
                          Ordine: {cat.sort_order ?? 0} · {cat.is_active ? "Activă" : "Inactivă"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        className="rounded-md border border-neutral-700 px-3 py-1 text-[11px] text-neutral-200 hover:border-red-500 hover:text-white"
                      >
                        Editează
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        className="text-[11px] text-red-400 hover:text-red-300"
                      >
                        Șterge
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
