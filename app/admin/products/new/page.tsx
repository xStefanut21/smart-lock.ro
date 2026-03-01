"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import SummernoteEditor from "@/components/summernote-editor";
import ProductOptionsManager from "@/components/product-options-manager";

type Brand = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string | null;
};

type OptionType = {
  id: string;
  name: string;
  values: { id: string; name: string }[];
};

type SelectedOption = {
  option_id: string;
  value_ids: string[]; // Array of selected value IDs
  price_modifier: number;
  required: boolean;
};

export default function AdminNewProductPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | "">("");
  const [availableOptions, setAvailableOptions] = useState<OptionType[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [priceModifiers, setPriceModifiers] = useState<Record<string, number>>({});

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

      // Load brands
      const { data: brandsData } = await supabase
        .from("brands")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });

      setBrands(brandsData || []);

      // Fetch options
      const { data: optionsData } = await supabase
        .from('options')
        .select('id, name')
        .order('name');

      if (optionsData) {
        const optionsWithValues = await Promise.all(
          optionsData.map(async (opt) => {
            const { data: vals } = await supabase
              .from('option_values')
              .select('id, name')
              .eq('option_id', opt.id)
              .order('sort_order');
            return { ...opt, values: vals || [] };
          })
        );
        setAvailableOptions(optionsWithValues);
      }
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
        name: name.trim(),
        slug: trimmedSlug,
        price: numericPrice,
        brand_id: brandId || null,
        short_description: shortDescription.trim() || null,
        image_url: finalImageUrl,
        stock: numericStock,
        is_active: isActive,
        description: description.trim() || null,
        category_id: categoryId || null,
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

    // Save product options
    if (selectedOptions.length > 0) {
      // Insert product options
      const productOptionsData = selectedOptions.map(sel => ({
        product_id: inserted.id,
        option_id: sel.option_id,
        required: sel.required,
        default_value_id: sel.value_ids && sel.value_ids.length > 0 ? sel.value_ids[0] : null, // Use first value as default
      }));

      console.log('Inserting productOptionsData:', productOptionsData);
      const { error: insertOptionsError } = await supabase.from('product_options').insert(productOptionsData);
      console.log('Insert options error:', insertOptionsError);

      // Insert selected values
      for (const sel of selectedOptions) {
        if (sel.value_ids && sel.value_ids.length > 0) {
          const selectedValuesData = sel.value_ids.map(valueId => ({
            product_id: inserted.id,
            option_id: sel.option_id,
            value_id: valueId
          }));
          console.log('Inserting selectedValuesData for option', sel.option_id, ':', selectedValuesData);
          const { error: insertValuesError } = await supabase.from('product_selected_values').insert(selectedValuesData);
          console.log('Insert values error for option', sel.option_id, ':', insertValuesError);
        }
      }

      // Update price modifiers for option values
      if (Object.keys(priceModifiers).length > 0) {
        console.log('Updating price modifiers:', priceModifiers);
        for (const [valueId, modifier] of Object.entries(priceModifiers)) {
          const { error: updateModifierError } = await supabase
            .from('option_values')
            .update({ price_modifier: modifier })
            .eq('id', valueId);
          console.log('Update modifier error for', valueId, ':', updateModifierError);
        }
      }
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
          <label className="text-neutral-300" htmlFor="brandId">
            Brand
          </label>
          <select
            id="brandId"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          >
            <option value="">Fără brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
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

        <ProductOptionsManager
          productId=""
          selectedOptions={selectedOptions}
          onOptionsChange={setSelectedOptions}
          priceModifiers={priceModifiers}
          onPriceModifiersChange={setPriceModifiers}
        />

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
          <label className="text-neutral-300" htmlFor="description">
            Descriere lungă (opțional)
          </label>
          <SummernoteEditor
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
