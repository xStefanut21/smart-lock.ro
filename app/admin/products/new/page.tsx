"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { RichTextEditor } from "@/components/rich-text-editor";

type Category = {
  id: string;
  name: string | null;
};

export default function AdminNewProductPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [colorOptions, setColorOptions] = useState("");
  const [hasInstallationOption, setHasInstallationOption] = useState(false);
  const [installationPrice, setInstallationPrice] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | "">("");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/admin/products/new");
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

      const { data: cats } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      setCategories((cats as Category[]) ?? []);
    }

    checkAdmin();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createSupabaseBrowserClient();

    const normalizedPriceString = price
      .trim()
      .replace(",", "."); // permitem atât 349,99 cât și 349.99

    const numericPrice = Number(normalizedPriceString);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setError("Te rog introdu un preț valid mai mare decât 0.");
      setSaving(false);
      return;
    }

    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      setError("Slug-ul este obligatoriu.");
      setSaving(false);
      return;
    }

    const numericStock = stock.trim() ? Number(stock.trim()) : 0;
    if (Number.isNaN(numericStock) || numericStock < 0) {
      setError("Te rog introdu un stoc valid (0 sau mai mare).");
      setSaving(false);
      return;
    }

    const numericInstallationPrice = hasInstallationOption
      ? Number(installationPrice.trim().replace(",", "."))
      : 0;
    if (hasInstallationOption && (Number.isNaN(numericInstallationPrice) || numericInstallationPrice < 0)) {
      setError("Te rog introdu un preț valid pentru montaj (0 sau mai mare).");
      setSaving(false);
      return;
    }

    let finalImageUrl = imageUrl.trim() || null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, imageFile);

      if (uploadError) {
        setError(
          `Nu am putut încărca imaginea: ${uploadError.message || "eroare necunoscută"}`
        );
        setSaving(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      finalImageUrl = publicUrl || null;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("products")
      .insert({
        name: name.trim() || null,
        slug: trimmedSlug,
        price: numericPrice,
        brand: brand.trim() || null,
        short_description: shortDescription.trim() || null,
        image_url: finalImageUrl,
        stock: numericStock,
        is_active: isActive,
        description: description.trim() || null,
        color_options: colorOptions.trim() || null,
        category_id: categoryId || null,
        has_installation_option: hasInstallationOption,
        installation_price: hasInstallationOption ? numericInstallationPrice : null,
      })
      .select("id")
      .maybeSingle<{ id: string }>();

    if (insertError || !inserted) {
      const message = insertError?.message || "eroare necunoscută";
      setError(`Nu am putut salva produsul: ${message}`);
      setSaving(false);
      return;
    }

    if (finalImageUrl) {
      await supabase.from("product_images").insert({
        product_id: inserted.id,
        image_url: finalImageUrl,
        sort_order: 0,
      });
    }

    setSaving(false);

    router.push("/admin/products");
  }

  if (checkingAuth) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-neutral-200">
        Se verifică drepturile de administrator...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-neutral-200">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 text-xs text-neutral-400 hover:text-white"
      >
        ← Înapoi la lista de produse
      </button>
      <h1 className="mb-4 text-lg font-semibold text-white">Adaugă produs nou</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 text-xs"
      >
        {error && (
          <p className="rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-red-300">
            {error}
          </p>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="name">
            Nume produs
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="slug">
            Slug (URL)
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="ex: yale-l100-smart-lock"
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
          <p className="text-[11px] text-neutral-500">
            Se va folosi în URL: /products/&lt;slug&gt;
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="price">
            Preț (RON)
          </label>
          <input
            id="price"
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="ex: 899.99"
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="brand">
            Brand
          </label>
          <input
            id="brand"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="ex: Yale"
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="categoryId">
            Categorie produs (pentru filtre)
          </label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          >
            <option value="">Fără categorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name || "(fără nume)"}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-neutral-500">
            Categorie folosită pentru butoanele de filtre și afișarea pe pagina de produse.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="shortDescription">
            Descriere scurtă
          </label>
          <textarea
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={3}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-red-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="colorOptions">
            Culori disponibile (opțional)
          </label>
          <input
            id="colorOptions"
            type="text"
            value={colorOptions}
            onChange={(e) => setColorOptions(e.target.value)}
            placeholder="ex: Negru, Gri, Alb"
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
          <p className="text-[11px] text-neutral-500">
            Introdu o listă de culori separate prin virgulă. Dacă lași câmpul gol, produsul nu va avea opțiuni de culoare.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="description">
            Descriere lungă (opțional)
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Adaugă o descriere detaliată a produsului..."
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="imageUrl">
            URL imagine produs
          </label>
          <input
            id="imageUrl"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
          <p className="text-[11px] text-neutral-500">
            Pentru început folosim un link direct către imagine. Mai târziu putem adăuga upload în Supabase Storage.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="imageFile">
            Sau încarcă fișier imagine
          </label>
          <input
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100 outline-none file:mr-2 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1 file:text-xs file:text-neutral-100 focus:border-red-500"
          />
          <p className="text-[11px] text-neutral-500">
            Dacă selectezi un fișier, acesta va fi încărcat în Supabase Storage (bucket
            "product-images"), iar URL-ul rezultat va fi folosit automat.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-neutral-300" htmlFor="stock">
              Stoc
            </label>
            <input
              id="stock"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="ex: 10"
              className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
            />
          </div>
          <div className="flex items-center gap-2 pt-5 text-neutral-200">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600"
            />
            <label htmlFor="isActive" className="text-xs text-neutral-300">
              Produs activ (vizibil pe site)
            </label>
          </div>
        </div>
        <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 text-xs">
          <h2 className="text-sm font-semibold text-white">Opțiune montaj</h2>
          <div className="flex items-center gap-2">
            <input
              id="hasInstallationOption"
              type="checkbox"
              checked={hasInstallationOption}
              onChange={(e) => setHasInstallationOption(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600"
            />
            <label htmlFor="hasInstallationOption" className="text-xs text-neutral-300">
              Acest produs are opțiune de montaj
            </label>
          </div>
          {hasInstallationOption && (
            <div className="flex flex-col gap-1">
              <label className="text-neutral-300" htmlFor="installationPrice">
                Preț montaj (RON)
              </label>
              <input
                id="installationPrice"
                type="text"
                inputMode="decimal"
                value={installationPrice}
                onChange={(e) => setInstallationPrice(e.target.value)}
                placeholder="ex: 250"
                className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
              />
              <p className="text-[11px] text-neutral-500">
                Prețul va fi afișat pe pagina produsului ca opțiune suplimentară.
              </p>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-md bg-red-600 px-6 py-2 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-60"
        >
          {saving ? "Se salvează produsul..." : "Salvează produsul"}
        </button>
      </form>
    </div>
  );
}
