"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import SummernoteEditor from "@/components/summernote-editor";
import ProductOptionsManager from "@/components/product-options-manager";

type AdminProduct = {
  id: string;
  name: string | null;
  slug: string;
  price: number;
  brand_id: string | null;
  brand: string | null; // Keep for backward compatibility
  short_description: string | null;
  image_url: string | null;
  stock: number | null;
  is_active: boolean | null;
  description: string | null;
  category_id: string | null;
  has_installation_option?: boolean | null;
  installation_price?: number | null;
};

type Brand = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string | null;
};

type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number | null;
};

type ProductManual = {
  id: string;
  title: string | null;
  pdf_url: string;
  storage_path: string | null;
  created_at: string;
};

type SelectedOption = {
  option_id: string;
  value_ids: string[]; // Array of selected value IDs
  price_modifier: number;
  required: boolean;
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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [productManuals, setProductManuals] = useState<ProductManual[]>([]);
  const [manualFiles, setManualFiles] = useState<File[]>([]);
  const [addingManuals, setAddingManuals] = useState(false);
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState("");
  const [hasInstallationOption, setHasInstallationOption] = useState(false);
  const [installationPrice, setInstallationPrice] = useState("");
  const [extraImages, setExtraImages] = useState<ProductImage[]>([]);
  const [extraImageFiles, setExtraImageFiles] = useState<File[]>([]);
  const [addingImage, setAddingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | "">("");
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [priceModifiers, setPriceModifiers] = useState<Record<string, number>>({});

  function getProductImagePathFromUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    const marker = "/product-images/";
    const index = url.indexOf(marker);

    if (index === -1) return null;

    return url.substring(index + marker.length);
  }

  function getProductManualPathFromUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    const marker = "/product-manuals/";
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
          "id, name, price, slug, short_description, image_url, brand_id, brand, stock, is_active, description, category_id, has_installation_option, installation_price"
        )
        .eq("id", id)
        .maybeSingle<AdminProduct>();

      if (error || !data) {
        setError("Nu am putut încărca produsul.");
        setLoadingProduct(false);
        return;
      }

      // Load brands
      const { data: brandsData } = await supabase
        .from("brands")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });

      setBrands(brandsData || []);

      // Set product data
      setName(data.name || "");
      setSlug(data.slug || "");
      setPrice(data.price?.toString() || "");
      setBrandId(data.brand_id || "");
      setShortDescription(data.short_description || "");
      setImageUrl(data.image_url || "");
      setStock(data.stock?.toString() || "");
      setIsActive(data.is_active ?? true);
      setDescription(data.description || "");
      setCategoryId(data.category_id || "");
      setHasInstallationOption(data.has_installation_option ?? false);
      setInstallationPrice(
        data.installation_price != null && !Number.isNaN(data.installation_price)
          ? String(data.installation_price)
          : ""
      );
      // @ts-ignore - category_id poate să nu fie încă pe tip
      setCategoryId((data as any).category_id ?? "");

      const { data: cats } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      setCategories((cats as Category[]) ?? []);

      // Load product options
      const { data: productOptionsData, error: optionsError } = await supabase
        .from('product_options')
        .select('*')
        .eq('product_id', id);

      // Load selected values
      const { data: selectedValuesData, error: valuesError } = await supabase
        .from('product_selected_values')
        .select('option_id, value_id')
        .eq('product_id', id);

      console.log('Loading data for product:', id);
      console.log('Product options error:', optionsError);
      console.log('Selected values error:', valuesError);
      console.log('Admin product options data:', { productOptionsData, selectedValuesData });

      if (productOptionsData && selectedValuesData) {
        // Group selected values by option_id
        const valuesByOption: Record<string, string[]> = {};
        selectedValuesData.forEach(sv => {
          if (!valuesByOption[sv.option_id]) {
            valuesByOption[sv.option_id] = [];
          }
          valuesByOption[sv.option_id].push(sv.value_id);
        });

        const options = productOptionsData.map(po => ({
          option_id: po.option_id,
          value_ids: valuesByOption[po.option_id] || [], // Get all selected values
          price_modifier: po.price_modifier,
          required: po.required
        }));
        setSelectedOptions(options);

        // Load existing price modifiers for the selected values
        const allValueIds = Object.values(valuesByOption).flat();
        if (allValueIds.length > 0) {
          const { data: priceModifiersData } = await supabase
            .from('option_values')
            .select('id, price_modifier')
            .in('id', allValueIds);

          if (priceModifiersData) {
            const modifiers: Record<string, number> = {};
            priceModifiersData.forEach(pmd => {
              if (pmd.price_modifier !== null && pmd.price_modifier !== undefined) {
                modifiers[pmd.id] = pmd.price_modifier;
              }
            });
            setPriceModifiers(modifiers);
          }
        }
      }

      const { data: imagesData } = await supabase
        .from("product_images")
        .select("id, image_url, sort_order")
        .eq("product_id", id)
        .order("sort_order", { ascending: true });

      if (imagesData && Array.isArray(imagesData)) {
        setExtraImages(imagesData as ProductImage[]);
      }

      const { data: manualsData } = await supabase
        .from("product_manuals")
        .select("id, title, pdf_url, storage_path, created_at")
        .eq("product_id", id)
        .order("created_at", { ascending: false });

      if (manualsData && Array.isArray(manualsData)) {
        setProductManuals(manualsData as ProductManual[]);
      }
      setLoadingProduct(false);
    }

    load();
  }, [id, router]);

  async function handleAddManuals() {
    if (!id || manualFiles.length === 0) return;

    setAddingManuals(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const newlyInserted: ProductManual[] = [];

    for (const file of manualFiles) {
      const fileExt = file.name.split(".").pop() || "pdf";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-manuals")
        .upload(filePath, file, { contentType: "application/pdf" });

      if (uploadError) {
        setError(
          `Nu am putut încărca unul dintre manuale: ${uploadError.message || "eroare necunoscută"}`
        );
        setAddingManuals(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-manuals").getPublicUrl(filePath);

      const title = file.name.replace(/\.pdf$/i, "");

      const { data: inserted, error: insertError } = await supabase
        .from("product_manuals")
        .insert({
          product_id: id,
          title: title || null,
          pdf_url: publicUrl,
          storage_path: filePath,
        })
        .select("id, title, pdf_url, storage_path, created_at")
        .maybeSingle<ProductManual>();

      if (insertError || !inserted) {
        setError(
          `Nu am putut salva unul dintre manuale: ${insertError?.message || "eroare necunoscută"}`
        );
        setAddingManuals(false);
        return;
      }

      newlyInserted.push(inserted);
    }

    setProductManuals((prev) => [...newlyInserted, ...prev]);
    setManualFiles([]);
    setAddingManuals(false);
  }

  async function handleDeleteManual(manual: ProductManual) {
    if (!id) return;
    if (!confirm("Sigur vrei să ștergi acest manual?")) return;

    const supabase = createSupabaseBrowserClient();

    if (manual.storage_path) {
      const { error: storageError } = await supabase.storage
        .from("product-manuals")
        .remove([manual.storage_path]);

      if (storageError) {
        setError(
          `Nu am putut șterge fișierul manualului din storage (rămâne acolo, dar nu va mai fi folosit): ${
            storageError.message || "eroare necunoscută"
          }`
        );
      }
    }

    const { error: deleteError } = await supabase
      .from("product_manuals")
      .delete()
      .eq("id", manual.id)
      .eq("product_id", id);

    if (deleteError) {
      setError(
        `Nu am putut șterge manualul: ${deleteError.message || "eroare necunoscută"}`
      );
      return;
    }

    setProductManuals((prev) => prev.filter((m) => m.id !== manual.id));
  }

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

    const numericInstallationPrice = hasInstallationOption
      ? Number(installationPrice.trim().replace(",", "."))
      : 0;
    if (hasInstallationOption && (Number.isNaN(numericInstallationPrice) || numericInstallationPrice < 0)) {
      setError("Te rog introdu un preț valid pentru montaj (0 sau mai mare).");
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
        brand_id: brandId || null,
        short_description: shortDescription.trim() || null,
        image_url: finalImageUrl,
        stock: numericStock,
        is_active: isActive,
        description: description.trim() || null,
        category_id: categoryId || null,
        has_installation_option: hasInstallationOption,
        installation_price: hasInstallationOption ? numericInstallationPrice : null,
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

    // Save product options
    if (selectedOptions.length > 0) {
      console.log('Saving selectedOptions:', selectedOptions);
      console.log('Saving priceModifiers:', priceModifiers);
      // Delete existing options and selected values first
      const { error: deleteOptionsError } = await supabase.from('product_options').delete().eq('product_id', id);
      const { error: deleteValuesError } = await supabase.from('product_selected_values').delete().eq('product_id', id);
      
      console.log('Delete errors:', { deleteOptionsError, deleteValuesError });
      
      // Insert new options
      const productOptionsData = selectedOptions.map(sel => ({
        product_id: id,
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
            product_id: id,
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

  async function handleDeleteProduct() {
    if (!id) return;
    if (!confirm("Sigur vrei să ștergi acest produs și toate imaginile asociate?")) return;

    setSaving(true);
    const supabase = createSupabaseBrowserClient();

    // Check if product has related orders
    const { data: orderItems, error: orderCheckError } = await supabase
      .from("order_items")
      .select("id")
      .eq("product_id", id)
      .limit(1);

    if (orderCheckError) {
      setError(`Eroare la verificarea comenzilor: ${orderCheckError.message}`);
      setSaving(false);
      return;
    }

    if (orderItems && orderItems.length > 0) {
      setError("Nu poți șterge acest produs deoarece există comenzi care îl conțin. Dezactivează produsul în schimb pentru a-l ascunde din catalog.");
      setSaving(false);
      return;
    }

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
          productId={id}
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

      <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 text-xs">
        <h2 className="mb-3 text-sm font-semibold text-white">Manuale produs (PDF)</h2>
        <p className="mb-3 text-[11px] text-neutral-400">
          Poți adăuga unul sau mai multe manuale PDF. Acestea vor fi afișate ca link-uri de descărcare pe pagina produsului.
        </p>

        <div className="mb-4 flex flex-col gap-2">
          <label className="text-neutral-300" htmlFor="manualFiles">
            Încarcă manuale PDF
          </label>
          <input
            id="manualFiles"
            type="file"
            accept="application/pdf"
            multiple
            onChange={(e) =>
              setManualFiles(e.target.files ? Array.from(e.target.files) : [])
            }
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100 outline-none file:mr-2 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1 file:text-xs file:text-neutral-100 focus:border-red-500"
          />
          <button
            type="button"
            disabled={manualFiles.length === 0 || addingManuals}
            onClick={handleAddManuals}
            className="inline-flex w-full items-center justify-center rounded-md bg-red-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-red-500 disabled:opacity-60 sm:w-auto"
          >
            {addingManuals ? "Se încarcă manualele..." : "Adaugă manuale"}
          </button>
        </div>

        {productManuals.length === 0 ? (
          <p className="text-[11px] text-neutral-500">
            Nu există încă manuale pentru acest produs.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {productManuals.map((m) => (
              <li
                key={m.id}
                className="flex flex-col gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-neutral-200">
                    {m.title || "Manual PDF"}
                  </p>
                  <a
                    href={m.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-[11px] text-blue-400 hover:underline"
                  >
                    {m.pdf_url}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={m.pdf_url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-[11px] text-neutral-200 hover:bg-neutral-800"
                  >
                    Descarcă
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteManual(m)}
                    className="rounded-md border border-red-700 bg-transparent px-3 py-1.5 text-[11px] text-red-300 hover:bg-red-900/30"
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
