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

type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number | null;
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
  const [extraImages, setExtraImages] = useState<ProductImage[]>([]);
  const [extraImageFiles, setExtraImageFiles] = useState<File[]>([]);
  const [addingImage, setAddingImage] = useState(false);

  function getProductImagePathFromUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    const marker = "/product-images/";
    const index = url.indexOf(marker);

    if (index === -1) return null;

    return url.substring(index + marker.length);
  }

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

      const { data: imagesData } = await supabase
        .from("product_images")
        .select("id, image_url, sort_order")
        .eq("product_id", id)
        .order("sort_order", { ascending: true });

      if (imagesData && Array.isArray(imagesData)) {
        setExtraImages(imagesData as ProductImage[]);
      }
      setLoadingProduct(false);
    }

    load();
  }, [id, router]);

  async function handleAddExtraImage() {
    if (!id || extraImageFiles.length === 0) return;

    setAddingImage(true);
    const supabase = createSupabaseBrowserClient();

    let currentMaxOrder = extraImages.reduce(
      (max, img) => (typeof img.sort_order === "number" && img.sort_order > max ? img.sort_order : max),
      0
    );

    const newlyInserted: ProductImage[] = [];

    for (const file of extraImageFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) {
        setError(
          `Nu am putut încărca una dintre imaginile suplimentare: ${
            uploadError.message || "eroare necunoscută"
          }`
        );
        setAddingImage(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      currentMaxOrder += 1;

      const { data: inserted, error: insertError } = await supabase
        .from("product_images")
        .insert({
          product_id: id,
          image_url: publicUrl,
          sort_order: currentMaxOrder,
        })
        .select("id, image_url, sort_order")
        .maybeSingle<ProductImage>();

      if (insertError || !inserted) {
        setError(
          `Nu am putut salva una dintre imaginile suplimentare: ${
            insertError?.message || "eroare necunoscută"
          }`
        );
        setAddingImage(false);
        return;
      }

      newlyInserted.push(inserted);
    }

    setExtraImages((prev) => [...prev, ...newlyInserted]);
    setExtraImageFiles([]);
    setAddingImage(false);
  }

  async function handleDeleteExtraImage(imageId: string) {
    if (!id) return;

    const imageToDelete = extraImages.find((img) => img.id === imageId);
    const supabase = createSupabaseBrowserClient();

    if (imageToDelete?.image_url) {
      const path = getProductImagePathFromUrl(imageToDelete.image_url);
      if (path) {
        const { error: storageError } = await supabase.storage
          .from("product-images")
          .remove([path]);

        if (storageError) {
          // nu blocăm ștergerea din DB, dar afișăm eroarea pentru debugging
          setError(
            `Nu am putut șterge fișierul imaginii din storage (rămâne acolo, dar nu va mai fi folosit): ${
              storageError.message || "eroare necunoscută"
            }`
          );
        }
      }
    }

    const { error: deleteError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId)
      .eq("product_id", id);

    if (deleteError) {
      setError(
        `Nu am putut șterge imaginea suplimentară: ${
          deleteError.message || "eroare necunoscută"
        }`
      );
      return;
    }

    setExtraImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  async function moveExtraImage(imageId: string, direction: "up" | "down") {
    if (!id) return;

    const index = extraImages.findIndex((img) => img.id === imageId);
    if (index === -1) return;

    const neighborIndex =
      direction === "up" ? index - 1 : index + 1;

    if (neighborIndex < 0 || neighborIndex >= extraImages.length) {
      return;
    }

    const current = extraImages[index];
    const neighbor = extraImages[neighborIndex];

    const currentOrder = typeof current.sort_order === "number" ? current.sort_order : 0;
    const neighborOrder = typeof neighbor.sort_order === "number" ? neighbor.sort_order : 0;

    const supabase = createSupabaseBrowserClient();

    const { error: error1 } = await supabase
      .from("product_images")
      .update({ sort_order: neighborOrder })
      .eq("id", current.id)
      .eq("product_id", id);

    if (error1) {
      setError(
        `Nu am putut reordona imaginile: ${error1.message || "eroare necunoscută"}`
      );
      return;
    }

    const { error: error2 } = await supabase
      .from("product_images")
      .update({ sort_order: currentOrder })
      .eq("id", neighbor.id)
      .eq("product_id", id);

    if (error2) {
      setError(
        `Nu am putut reordona imaginile: ${error2.message || "eroare necunoscută"}`
      );
      return;
    }

    setExtraImages((prev) => {
      const copy = [...prev];
      copy[index] = { ...neighbor, sort_order: currentOrder };
      copy[neighborIndex] = { ...current, sort_order: neighborOrder };
      return copy;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!id) return;

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

    const oldMainImageUrl = imageUrl;

    let finalImageUrl = imageUrl.trim() || null;
    let newMainImagePath: string | null = null;

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
      newMainImagePath = filePath;
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

    if (updateError) {
      setError(
        `Nu am putut salva modificările: ${
          updateError.message || "eroare necunoscută"
        }`
      );
      setSaving(false);
      return;
    }

    if (newMainImagePath) {
      const oldPath = getProductImagePathFromUrl(oldMainImageUrl);
      if (oldPath && oldPath !== newMainImagePath) {
        await supabase.storage
          .from("product-images")
          .remove([oldPath]);
      }
    }

    if (finalImageUrl) {
      const alreadyInGallery = extraImages.some(
        (img) => img.image_url === finalImageUrl
      );

      if (!alreadyInGallery) {
        const minOrder = extraImages.reduce(
          (min, img) =>
            typeof img.sort_order === "number" && img.sort_order < min
              ? img.sort_order
              : min,
          0
        );

        const { data: insertedImage } = await supabase
          .from("product_images")
          .insert({
            product_id: id,
            image_url: finalImageUrl,
            sort_order: minOrder - 1,
          })
          .select("id, image_url, sort_order")
          .maybeSingle<ProductImage>();

        if (insertedImage) {
          setExtraImages((prev) => [...prev, insertedImage]);
        }
      }
    }

    setSaving(false);

    router.push("/admin/products");
  }

  async function handleDeleteProduct() {
    if (!id) return;
    if (!confirm("Sigur vrei să ștergi acest produs și toate imaginile asociate?")) return;

    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    const pathsToDelete: string[] = [];

    const { data: images } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", id);

    if (images && Array.isArray(images)) {
      for (const img of images as { image_url: string }[]) {
        const p = getProductImagePathFromUrl(img.image_url);
        if (p) pathsToDelete.push(p);
      }
    }

    const mainPath = getProductImagePathFromUrl(imageUrl);
    if (mainPath) pathsToDelete.push(mainPath);

    if (pathsToDelete.length > 0) {
      await supabase.storage.from("product-images").remove(pathsToDelete);
    }

    await supabase
      .from("product_images")
      .delete()
      .eq("product_id", id);

    const { error: deleteProductError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    setSaving(false);

    if (deleteProductError) {
      setError(
        `Nu am putut șterge produsul: ${
          deleteProductError.message || "eroare necunoscută"
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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">
          Editează produsul
        </h1>
        <button
          type="button"
          onClick={handleDeleteProduct}
          disabled={saving}
          className="rounded-md border border-red-700 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900/30 disabled:opacity-60"
        >
          Șterge produsul
        </button>
      </div>
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

      <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 text-xs">
        <h2 className="mb-3 text-sm font-semibold text-white">Imagini suplimentare produs</h2>
        <p className="mb-3 text-[11px] text-neutral-400">
          Poți adăuga mai multe imagini pentru acest produs. Acestea vor apărea în
          galeria de imagini de pe pagina produsului, cu posibilitate de scroll
          stânga-dreapta și buline, similar cu bannerele de pe homepage.
        </p>

        <div className="mb-4 flex flex-col gap-2">
          <label className="text-neutral-300" htmlFor="extraImageFile">
            Încarcă o imagine suplimentară
          </label>
          <input
            id="extraImageFile"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setExtraImageFiles(e.target.files ? Array.from(e.target.files) : [])
            }
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100 outline-none file:mr-2 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1 file:text-xs file:text-neutral-100 focus:border-red-500"
          />
          <button
            type="button"
            disabled={extraImageFiles.length === 0 || addingImage}
            onClick={handleAddExtraImage}
            className="inline-flex w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-red-500 disabled:opacity-60 sm:w-auto"
          >
            {addingImage ? "Se încarcă imaginea..." : "Adaugă imagine suplimentară"}
          </button>
        </div>

        {extraImages.length === 0 ? (
          <p className="text-[11px] text-neutral-500">
            Nu există încă imagini suplimentare pentru acest produs.
          </p>
        ) : (
          <ul className="mt-2 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {extraImages.map((img) => (
              <li
                key={img.id}
                className="flex flex-col overflow-hidden rounded-md border border-neutral-800 bg-neutral-900"
              >
                <div className="flex h-32 items-center justify-center overflow-hidden bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt="Imagine suplimentară produs"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px] text-neutral-300">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-500">
                      sortare: {typeof img.sort_order === "number" ? img.sort_order : 0}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveExtraImage(img.id, "up")}
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-600 text-[10px] text-neutral-200 hover:border-red-500 hover:text-white"
                        aria-label="Mută imaginea mai sus"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveExtraImage(img.id, "down")}
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-neutral-600 text-[10px] text-neutral-200 hover:border-red-500 hover:text-white"
                        aria-label="Mută imaginea mai jos"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteExtraImage(img.id)}
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
  );
}
