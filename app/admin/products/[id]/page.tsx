"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AdminProduct = {
  id: string;
  name: string | null;
  slug: string;
  price: number;
  brand: string | null;
  short_description: string | null;
  image_url: string | null;
  stock: number | null;
  is_active: boolean | null;
  description: string | null;
};

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingProduct, setLoadingProduct] = useState(true);
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

  useEffect(() => {
    if (!id) return;

    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace(`/login?redirect=/admin/products/${id}`);
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
        .from("products")
        .select(
          "id, name, price, slug, short_description, image_url, brand, stock, is_active, description"
        )
        .eq("id", id)
        .maybeSingle<AdminProduct>();

      if (error || !data) {
        setError("Nu am putut încărca produsul.");
        setLoadingProduct(false);
        return;
      }

      setName(data.name ?? "");
      setSlug(data.slug);
      setPrice(String(data.price));
      setBrand(data.brand ?? "");
      setShortDescription(data.short_description ?? "");
      setImageUrl(data.image_url ?? "");
      setStock(
        typeof data.stock === "number" && !Number.isNaN(data.stock)
          ? String(data.stock)
          : ""
      );
      setIsActive(data.is_active !== false);
      setDescription(data.description ?? "");
      setLoadingProduct(false);
    }

    load();
  }, [id, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;

    setError(null);
    setSaving(true);

    const supabase = createSupabaseBrowserClient();

    const normalizedPriceString = price
      .trim()
      .replace(/\./g, "") // eliminăm separatoarele de mii
      .replace(",", "."); // înlocuim virgula cu punct

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

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: name.trim() || null,
        slug: trimmedSlug,
        price: numericPrice,
        brand: brand.trim() || null,
        short_description: shortDescription.trim() || null,
        image_url: finalImageUrl,
        stock: numericStock,
        is_active: isActive,
        description: description.trim() || null,
      })
      .eq("id", id);

    setSaving(false);

    if (updateError) {
      setError(
        `Nu am putut salva modificările: ${
          updateError.message || "eroare necunoscută"
        }`
      );
      return;
    }

    router.push("/admin/products");
  }

  if (!id) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-neutral-200">
        ID-ul produsului lipseste.
      </div>
    );
  }

  if (checkingAuth || loadingProduct) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă datele produsului...
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
      <h1 className="mb-4 text-lg font-semibold text-white">
        Editează produsul
      </h1>
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
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
          <p className="text-[11px] text-neutral-500">
            Se folosește în URL: /products/&lt;slug&gt;
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
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
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
          <label className="text-neutral-300" htmlFor="description">
            Descriere lungă (opțional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none focus:border-red-500"
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
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
          <p className="text-[11px] text-neutral-500">
            Folosește un link direct către fișierul imagine (ex: https://.../poza.jpg).
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="imageFile">
            Sau încarcă fișier imagine nou
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
            "product-images"), iar URL-ul rezultat va înlocui imaginea curentă.
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
          {saving ? "Se salvează modificările..." : "Salvează modificările"}
        </button>
      </form>
    </div>
  );
}
