"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  seo_h1?: string;
  seo_h2?: string;
  seo_h3?: string;
  image_alt?: string;
  image_title?: string;
  etichete_produs?: string;
}

interface SEOFormData {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  seo_h1: string;
  seo_h2: string;
  seo_h3: string;
  image_alt: string;
  image_title: string;
  etichete_produs: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  seo_url?: string;
  meta_title?: string;
  meta_keywords?: string;
  meta_description?: string;
}

interface CategorySEOFormData {
  seo_url: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

interface BrandSEOFormData {
  seo_url: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

interface ImageSEO {
  id: string;
  product_id: string;
  image_url: string;
  meta_name?: string;
  meta_alt?: string;
  meta_title?: string;
  product_name?: string;
}

interface BrandSEO {
  id: string;
  name: string;
  seo_url?: string;
  meta_title?: string;
  meta_keywords?: string;
  meta_description?: string;
}

export default function AdminSEOSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'images' | 'brands'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<CategorySEOFormData>({
    seo_url: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  // Images state
  const [images, setImages] = useState<ImageSEO[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageSEO | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [imageFormData, setImageFormData] = useState({
    meta_name: '',
    meta_alt: '',
    meta_title: ''
  });

  // Brands state
  const [brands, setBrands] = useState<BrandSEO[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandSEO | null>(null);
  const [editingBrand, setEditingBrand] = useState<string | null>(null);
  const [brandFormData, setBrandFormData] = useState<BrandSEOFormData>({
    seo_url: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  const [formData, setFormData] = useState<SEOFormData>({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    seo_h1: '',
    seo_h2: '',
    seo_h3: '',
    image_alt: '',
    image_title: '',
    etichete_produs: ''
  });

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login?redirect=/admin/seo");
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

      // Load all products with SEO fields
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, slug, price, image_url, meta_title, meta_description, meta_keywords, seo_h1, seo_h2, seo_h3, image_alt, image_title, etichete_produs")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (productsError) {
        setError("Eroare la încărcarea produselor: " + productsError.message);
      } else {
        setProducts(productsData || []);
      }

      // Load all categories with SEO fields
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name, slug, seo_url, meta_title, meta_description, meta_keywords")
        .order("name", { ascending: true });

      if (categoriesError) {
        console.error("Error loading categories:", categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // Load all product images with SEO fields
      const { data: imagesData, error: imagesError } = await supabase
        .from("product_images")
        .select("id, product_id, image_url, meta_name, meta_alt, meta_title, products(name)")
        .order("created_at", { ascending: false });

      if (imagesError) {
        console.error("Error loading images:", imagesError);
      } else {
        const processedImages = (imagesData || []).map((img: any) => ({
          ...img,
          product_name: img.products?.name || 'Produs necunoscut'
        }));
        setImages(processedImages);
      }

      // Load all brands with SEO fields
      const { data: brandsData, error: brandsError } = await supabase
        .from("brands")
        .select("id, name, seo_url, meta_title, meta_description, meta_keywords")
        .order("name", { ascending: true });

      if (brandsError) {
        console.error("Error loading brands:", brandsError);
      } else {
        setBrands(brandsData || []);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  const handleEditSEO = (product: Product) => {
    setSelectedProduct(product);
    setEditingProduct(product.id);
    setFormData({
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      meta_keywords: product.meta_keywords || '',
      seo_h1: product.seo_h1 || '',
      seo_h2: product.seo_h2 || '',
      seo_h3: product.seo_h3 || '',
      image_alt: product.image_alt || '',
      image_title: product.image_title || '',
      etichete_produs: product.etichete_produs || ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleSaveSEO = async () => {
    if (!selectedProduct) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from("products")
      .update({
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        meta_keywords: formData.meta_keywords || null,
        seo_h1: formData.seo_h1 || null,
        seo_h2: formData.seo_h2 || null,
        seo_h3: formData.seo_h3 || null,
        image_alt: formData.image_alt || null,
        image_title: formData.image_title || null,
        etichete_produs: formData.etichete_produs || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", selectedProduct.id);

    if (error) {
      setError("Eroare la salvarea datelor SEO: " + error.message);
    } else {
      setSuccess("Datele SEO au fost salvate cu succes!");

      // Update local products state
      setProducts(products.map(p =>
        p.id === selectedProduct.id
          ? { ...p, ...formData }
          : p
      ));

      // Close editing mode after a short delay
      setTimeout(() => {
        setEditingProduct(null);
        setSelectedProduct(null);
      }, 2000);
    }

    setSaving(false);
  };

  // Category SEO functions
  const handleEditCategorySEO = (category: Category) => {
    setSelectedCategory(category);
    setEditingCategory(category.id);
    setCategoryFormData({
      seo_url: category.seo_url || '',
      meta_title: category.meta_title || '',
      meta_description: category.meta_description || '',
      meta_keywords: category.meta_keywords || ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleSaveCategorySEO = async () => {
    if (!selectedCategory) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from("categories")
        .update({
          seo_url: categoryFormData.seo_url || null,
          meta_title: categoryFormData.meta_title || null,
          meta_description: categoryFormData.meta_description || null,
          meta_keywords: categoryFormData.meta_keywords || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedCategory.id);

      if (error) {
        setError("Eroare la salvarea datelor SEO pentru categorie: " + error.message);
      } else {
        setSuccess("Datele SEO pentru categorie au fost salvate cu succes!");

        // Update local state
        setCategories(prev => prev.map(cat =>
          cat.id === selectedCategory.id
            ? { ...cat, ...categoryFormData }
            : cat
        ));

        setEditingCategory(null);
        setSelectedCategory(null);
      }
    } catch (error: any) {
      console.error("Error saving category SEO:", error);
      setError(error.message || "Eroare neașteptată la salvare");
    } finally {
      setSaving(false);
    }
  };

  const generateCategorySuggestions = (category: Category) => {
    return {
      seo_url: category.slug,
      meta_title: `${category.name} - Cumpără online la cele mai bune prețuri`,
      meta_description: `Descoperă gama completă de ${category.name.toLowerCase()} la Smart Lock. Livrare rapidă în toată România.`,
      meta_keywords: `${category.name.toLowerCase()}, cumpărare online, livrare rapidă, smart lock`
    };
  };

  const handleCategorySuggestions = () => {
    if (!selectedCategory) return;
    const suggestions = generateCategorySuggestions(selectedCategory);
    setCategoryFormData(suggestions);
  };

  // Image SEO functions
  const handleEditImageSEO = (image: ImageSEO) => {
    setSelectedImage(image);
    setEditingImage(image.id);
    setImageFormData({
      meta_name: image.meta_name || '',
      meta_alt: image.meta_alt || '',
      meta_title: image.meta_title || ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleSaveImageSEO = async () => {
    if (!selectedImage) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from("product_images")
        .update({
          meta_name: imageFormData.meta_name || null,
          meta_alt: imageFormData.meta_alt || null,
          meta_title: imageFormData.meta_title || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedImage.id);

      if (error) {
        setError("Eroare la salvarea datelor SEO pentru imagine: " + error.message);
      } else {
        setSuccess("Datele SEO pentru imagine au fost salvate cu succes!");

        // Update local state
        setImages(prev => prev.map(img =>
          img.id === selectedImage.id
            ? { ...img, ...imageFormData }
            : img
        ));

        setEditingImage(null);
        setSelectedImage(null);
      }
    } catch (error: any) {
      console.error("Error saving image SEO:", error);
      setError(error.message || "Eroare neașteptată la salvare");
    } finally {
      setSaving(false);
    }
  };

  const generateImageSuggestions = (image: ImageSEO) => {
    const productName = image.product_name || 'Produs';
    return {
      meta_name: `${productName.toLowerCase().replace(/\s+/g, '-')}-imagine-${image.id.slice(-4)}`,
      meta_alt: `Imagine ${productName} - Smart Lock`,
      meta_title: `Imagine detaliată ${productName} - Smart Lock`
    };
  };

  const handleImageSuggestions = () => {
    if (!selectedImage) return;
    const suggestions = generateImageSuggestions(selectedImage);
    setImageFormData(suggestions);
  };

  // Brand SEO functions
  const handleEditBrandSEO = (brand: BrandSEO) => {
    setSelectedBrand(brand);
    setEditingBrand(brand.id);
    setBrandFormData({
      seo_url: brand.seo_url || '',
      meta_title: brand.meta_title || '',
      meta_description: brand.meta_description || '',
      meta_keywords: brand.meta_keywords || ''
    });
    setError(null);
    setSuccess(null);
  };

  const handleSaveBrandSEO = async () => {
    if (!selectedBrand) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from("brands")
      .update({
        seo_url: brandFormData.seo_url || null,
        meta_title: brandFormData.meta_title || null,
        meta_description: brandFormData.meta_description || null,
        meta_keywords: brandFormData.meta_keywords || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", selectedBrand.id);

    if (error) {
      setError("Eroare la salvarea datelor SEO pentru brand: " + error.message);
    } else {
      setSuccess("Datele SEO pentru brand au fost salvate cu succes!");

      // Update local state
      setBrands(brands.map(b =>
        b.id === selectedBrand.id
          ? { ...b, ...brandFormData }
          : b
      ));

      setEditingBrand(null);
      setSelectedBrand(null);
    }
    setSaving(false);
  };

  const generateBrandSuggestions = (brand: BrandSEO) => {
    return {
      seo_url: brand.name.toLowerCase().replace(/\s+/g, '-'),
      meta_title: `${brand.name} - Produse de calitate la Smart Lock`,
      meta_description: `Descoperă toate produsele din brand-ul ${brand.name} disponibile la Smart Lock. Calitate superioară, prețuri competitive și livrare rapidă.`,
      meta_keywords: `${brand.name.toLowerCase()}, brand, produse, smart lock, calitate, ${brand.name.toLowerCase()} produse`
    };
  };

  const handleBrandSuggestions = () => {
    if (!selectedBrand) return;
    const suggestions = generateBrandSuggestions(selectedBrand);
    setBrandFormData(suggestions);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setSelectedProduct(null);
    setFormData({
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      seo_h1: '',
      seo_h2: '',
      seo_h3: '',
      image_alt: '',
      image_title: '',
      etichete_produs: ''
    });
  };

  const generateSuggestions = (product: Product) => {
    const suggestions = {
      meta_title: `${product.name} - Cumpără acum la Smart Lock`,
      meta_description: `Descoperă ${product.name} la prețul de ${product.price} RON. Calitate superioară, livrare rapidă în toată România. Comanzi online cu încredere.`,
      meta_keywords: `${product.name}, smart lock, încuietoare electronică, securitate, ${product.name.toLowerCase()}`,
      seo_h1: product.name,
      seo_h2: `De ce să alegi ${product.name}?`,
      seo_h3: `Caracteristici principale`,
      image_alt: `Imagine produs ${product.name}`,
      image_title: `${product.name} - Smart Lock`,
      etichete_produs: `${product.name}, încuietoare, securitate, electronic`
    };
    return suggestions;
  };

  const applySuggestions = () => {
    if (!selectedProduct) return;
    const suggestions = generateSuggestions(selectedProduct);
    setFormData(suggestions);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă setările SEO...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-neutral-200">
      <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6">
        <h1 className="mb-1 text-lg font-semibold text-white">
          🔍 Optimizare SEO Completă
        </h1>
        <p className="text-xs text-neutral-400">
          Gestionează setările SEO pentru produse, categorii, imagini și brand-uri. Optimizează titluri, descrieri și meta tag-uri pentru o vizibilitate maximă în motoarele de căutare.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-neutral-800">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-300'
            }`}
          >
            🛍️ Produse
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-300'
            }`}
          >
            📁 Categorii
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'images'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-300'
            }`}
          >
            🖼️ Imagini
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'brands'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-300'
            }`}
          >
            🏷️ Brand-uri
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-800 bg-green-950/50 p-4 text-green-200">
          {success}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-lg border border-neutral-800 bg-neutral-950/80 p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 flex-shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-neutral-500">Fără imagine</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm truncate">{product.name}</h3>
                <p className="text-xs text-neutral-400">{product.price} RON</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {product.meta_title && <span className="text-xs bg-blue-900/50 text-blue-200 px-2 py-1 rounded">Meta Title</span>}
                  {product.meta_description && <span className="text-xs bg-green-900/50 text-green-200 px-2 py-1 rounded">Meta Desc</span>}
                  {product.seo_h1 && <span className="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded">H1</span>}
                  {product.etichete_produs && <span className="text-xs bg-orange-900/50 text-orange-200 px-2 py-1 rounded">Tags</span>}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleEditSEO(product)}
              className="w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Editare SEO
            </button>
          </div>
        ))}
      </div>
      )}

      {/* SEO Editing Modal/Panel */}
      {editingProduct && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 rounded-xl border border-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  SEO pentru: {selectedProduct.name}
                </h2>
                <button
                  onClick={handleCancel}
                  className="text-neutral-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-end mb-4">
                <button
                  onClick={applySuggestions}
                  className="px-3 py-1 text-xs bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600 transition-colors"
                >
                  Sugestii automate
                </button>
              </div>

              <div className="space-y-4">
                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder={`Cumpără ${selectedProduct.name} la Smart Lock`}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    maxLength={60}
                  />
                  <p className="text-xs text-neutral-400 mt-1">{formData.meta_title.length}/60 caractere</p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder={`Descoperă ${selectedProduct.name} la prețul de ${selectedProduct.price} RON...`}
                    rows={3}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    maxLength={160}
                  />
                  <p className="text-xs text-neutral-400 mt-1">{formData.meta_description.length}/160 caractere</p>
                </div>

                {/* Meta Keywords */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                    placeholder={`${selectedProduct.name}, smart lock, securitate`}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* SEO H1 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    SEO H1
                  </label>
                  <input
                    type="text"
                    value={formData.seo_h1}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_h1: e.target.value }))}
                    placeholder={selectedProduct.name}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* SEO H2 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    SEO H2
                  </label>
                  <input
                    type="text"
                    value={formData.seo_h2}
                    onChange={(e) => setFormData((prev: SEOFormData) => ({ ...prev, seo_h2: e.target.value }))}
                    placeholder={`De ce să alegi ${selectedProduct.name}?`}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* SEO H3 */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    SEO H3
                  </label>
                  <input
                    type="text"
                    value={formData.seo_h3}
                    onChange={(e) => setFormData((prev: SEOFormData) => ({ ...prev, seo_h3: e.target.value }))}
                    placeholder="Caracteristici principale"
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Image Alt */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    Image ALT
                  </label>
                  <input
                    type="text"
                    value={formData.image_alt}
                    onChange={(e) => setFormData((prev: SEOFormData) => ({ ...prev, image_alt: e.target.value }))}
                    placeholder={`Imagine produs ${selectedProduct.name}`}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Image Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    Image TITLE
                  </label>
                  <input
                    type="text"
                    value={formData.image_title}
                    onChange={(e) => setFormData((prev: SEOFormData) => ({ ...prev, image_title: e.target.value }))}
                    placeholder={`${selectedProduct.name} - Smart Lock`}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Etichete Produs */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    Etichete Produs
                  </label>
                  <textarea
                    value={formData.etichete_produs}
                    onChange={(e) => setFormData((prev: SEOFormData) => ({ ...prev, etichete_produs: e.target.value }))}
                    placeholder={`${selectedProduct.name}, încuietoare, securitate, electronic`}
                    rows={2}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600 transition-colors"
                  disabled={saving}
                >
                  Anulează
                </button>
                <button
                  onClick={handleSaveSEO}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                  {saving ? "Se salvează..." : "Salvează SEO"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Categories Header */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              📁 Optimizare SEO Categorii
            </h2>
            <p className="text-sm text-neutral-400">
              Gestionează setările SEO pentru fiecare categorie: SEO_URL, META_TITLE, META_KEYWORDS, META_DESCRIPTION
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border border-neutral-800 bg-neutral-950/80 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                    <p className="text-xs text-neutral-400 mb-2">Slug: {category.slug}</p>

                    {/* SEO Status Indicators */}
                    <div className="flex flex-wrap gap-1 text-xs">
                      {category.seo_url && (
                        <span className="px-2 py-0.5 bg-green-900/40 text-green-300 rounded">
                          URL
                        </span>
                      )}
                      {category.meta_title && (
                        <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded">
                          Title
                        </span>
                      )}
                      {category.meta_description && (
                        <span className="px-2 py-0.5 bg-purple-900/40 text-purple-300 rounded">
                          Desc
                        </span>
                      )}
                      {category.meta_keywords && (
                        <span className="px-2 py-0.5 bg-orange-900/40 text-orange-300 rounded">
                          Keywords
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleEditCategorySEO(category)}
                  className="w-full px-3 py-2 bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600 transition-colors"
                >
                  Editare SEO
                </button>
              </div>
            ))}
          </div>

          {/* Category Edit Modal */}
          {editingCategory && selectedCategory && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-neutral-900 rounded-xl border border-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      Editare SEO: {selectedCategory.name}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setSelectedCategory(null);
                      }}
                      className="text-neutral-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* SEO URL */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-1">
                        SEO URL
                      </label>
                      <input
                        type="text"
                        value={categoryFormData.seo_url}
                        onChange={(e) => setCategoryFormData((prev: CategorySEOFormData) => ({ ...prev, seo_url: e.target.value }))}
                        placeholder={selectedCategory.slug}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        URL personalizat pentru categoria (opțional, dacă este gol se folosește slug-ul)
                      </p>
                    </div>

                    {/* Meta Title */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={categoryFormData.meta_title}
                        onChange={(e) => setCategoryFormData((prev: CategorySEOFormData) => ({ ...prev, meta_title: e.target.value }))}
                        placeholder={`${selectedCategory.name} - Cumpără online la cele mai bune prețuri`}
                        maxLength={60}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        {categoryFormData.meta_title.length}/60 caractere
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        value={categoryFormData.meta_description}
                        onChange={(e) => setCategoryFormData((prev: CategorySEOFormData) => ({ ...prev, meta_description: e.target.value }))}
                        placeholder={`Descoperă gama completă de ${selectedCategory.name.toLowerCase()} la Smart Lock. Livrare rapidă în toată România.`}
                        rows={3}
                        maxLength={160}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        {categoryFormData.meta_description.length}/160 caractere
                      </p>
                    </div>

                    {/* Meta Keywords */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={categoryFormData.meta_keywords}
                        onChange={(e) => setCategoryFormData((prev: CategorySEOFormData) => ({ ...prev, meta_keywords: e.target.value }))}
                        placeholder={`${selectedCategory.name.toLowerCase()}, cumpărare online, livrare rapidă, smart lock`}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Cuvinte cheie separate prin virgulă
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleCategorySuggestions}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
                    >
                      Sugestii automate
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setSelectedCategory(null);
                      }}
                      className="flex-1 px-4 py-2 bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600 transition-colors"
                    >
                      Anulează
                    </button>
                    <button
                      onClick={handleSaveCategorySEO}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Se salvează..." : "Salvează SEO"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'images' && (
        <div className="space-y-6">
          {/* Images Header */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              🖼️ Optimizare SEO Imagini
            </h2>
            <p className="text-sm text-neutral-400">
              Gestionează metadatele pentru imagini: meta_name, meta_alt, meta_title pentru o mai bună indexare în motoarele de căutare
            </p>
          </div>

          {/* Images Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.slice(0, 20).map((image) => (
              <div
                key={image.id}
                className="rounded-lg border border-neutral-800 bg-neutral-950/80 p-4"
              >
                <div className="aspect-square mb-3 overflow-hidden rounded-md border border-neutral-700 bg-neutral-900">
                  <img
                    src={image.image_url}
                    alt={image.meta_alt || `Imagine ${image.product_name}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="mb-3">
                  <h3 className="font-semibold text-white text-sm mb-1 truncate">
                    {image.product_name}
                  </h3>
                  <p className="text-xs text-neutral-400 mb-2">
                    ID: {image.id.slice(-8)}
                  </p>

                  {/* SEO Status Indicators */}
                  <div className="flex flex-wrap gap-1 text-xs">
                    {image.meta_name && (
                      <span className="px-2 py-0.5 bg-green-900/40 text-green-300 rounded">
                        Name
                      </span>
                    )}
                    {image.meta_alt && (
                      <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 rounded">
                        Alt
                      </span>
                    )}
                    {image.meta_title && (
                      <span className="px-2 py-0.5 bg-purple-900/40 text-purple-300 rounded">
                        Title
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleEditImageSEO(image)}
                  className="w-full px-3 py-2 bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600 transition-colors text-sm"
                >
                  Editare SEO
                </button>
              </div>
            ))}
          </div>

          {images.length > 20 && (
            <div className="text-center text-neutral-400 text-sm">
              Se afișează primele 20 de imagini. Total: {images.length} imagini
            </div>
          )}

          {/* Image Edit Modal */}
          {editingImage && selectedImage && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-neutral-900 rounded-xl border border-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Editare SEO Imagine
                    </h3>
                    <button
                      onClick={() => {
                        setEditingImage(null);
                        setSelectedImage(null);
                      }}
                      className="text-neutral-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Image Preview */}
                  <div className="flex justify-center mb-6">
                    <div className="w-48 h-48 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900">
                      <img
                        src={selectedImage.image_url}
                        alt={selectedImage.meta_alt || `Imagine ${selectedImage.product_name}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="mb-4 text-center">
                    <p className="text-sm text-neutral-400">
                      Produs: <span className="text-white font-medium">{selectedImage.product_name}</span>
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Meta Name */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-1">
                        Meta Name
                      </label>
                      <input
                        type="text"
                        value={imageFormData.meta_name}
                        onChange={(e) => setImageFormData((prev) => ({ ...prev, meta_name: e.target.value }))}
                        placeholder={`${selectedImage.product_name?.toLowerCase().replace(/\s+/g, '-')}-imagine-${selectedImage.id.slice(-4)}`}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Nume descriptiv pentru imagine (folosit în SEO și organizare)
                      </p>
                    </div>

                    {/* Meta Alt */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-1">
                        Meta Alt Text
                      </label>
                      <input
                        type="text"
                        value={imageFormData.meta_alt}
                        onChange={(e) => setImageFormData((prev) => ({ ...prev, meta_alt: e.target.value }))}
                        placeholder={`Imagine ${selectedImage.product_name} - Smart Lock`}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Text alternativ pentru accesibilitate și SEO
                      </p>
                    </div>

                    {/* Meta Title */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-200 mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={imageFormData.meta_title}
                        onChange={(e) => setImageFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
                        placeholder={`Imagine detaliată ${selectedImage.product_name} - Smart Lock`}
                        className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Atribut title pentru imagine (se afișează la hover)
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleImageSuggestions}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-colors"
                    >
                      Sugestii automate
                    </button>
                    <button
                      onClick={() => {
                        setEditingImage(null);
                        setSelectedImage(null);
                      }}
                      className="flex-1 px-4 py-2 bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600 transition-colors"
                    >
                      Anulează
                    </button>
                    <button
                      onClick={handleSaveImageSEO}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Se salvează..." : "Salvează SEO"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brands Tab */}
      {activeTab === 'brands' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Management Brand-uri SEO</h2>
            <p className="text-neutral-400 mb-6">
              Gestionează setările SEO pentru fiecare brand din catalogul tău. Optimizează titluri, descrieri și meta tag-uri pentru o vizibilitate maximă în motoarele de căutare.
            </p>

            {brands.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🏷️</div>
                <h3 className="text-lg font-semibold text-white mb-2">Niciun brand găsit</h3>
                <p className="text-neutral-400">Nu există brand-uri în baza de date sau acestea nu sunt încărcate.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="rounded-lg border border-neutral-700 bg-neutral-900/50 p-4 hover:bg-neutral-900/80 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-white text-sm mb-1">{brand.name}</h3>
                        <div className="flex flex-wrap gap-1">
                          {brand.meta_title && <span className="text-xs bg-blue-900/50 text-blue-200 px-2 py-1 rounded">Meta Title</span>}
                          {brand.meta_description && <span className="text-xs bg-green-900/50 text-green-200 px-2 py-1 rounded">Meta Desc</span>}
                          {brand.seo_url && <span className="text-xs bg-purple-900/50 text-purple-200 px-2 py-1 rounded">SEO URL</span>}
                          {brand.meta_keywords && <span className="text-xs bg-orange-900/50 text-orange-200 px-2 py-1 rounded">Keywords</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEditBrandSEO(brand)}
                      className="w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
                    >
                      Editare SEO
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Brand SEO Editing Modal */}
      {editingBrand && selectedBrand && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 rounded-xl border border-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  SEO pentru Brand: {selectedBrand.name}
                </h2>
                <button
                  onClick={() => {
                    setEditingBrand(null);
                    setSelectedBrand(null);
                  }}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* SEO URL */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    SEO URL
                  </label>
                  <input
                    type="text"
                    value={brandFormData.seo_url}
                    onChange={(e) => setBrandFormData((prev: BrandSEOFormData) => ({ ...prev, seo_url: e.target.value }))}
                    placeholder={selectedBrand.name.toLowerCase().replace(/\s+/g, '-')}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    URL personalizat pentru pagina brand-ului (opțional, dacă este gol se folosește numele brand-ului)
                  </p>
                </div>

                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={brandFormData.meta_title}
                    onChange={(e) => setBrandFormData((prev: BrandSEOFormData) => ({ ...prev, meta_title: e.target.value }))}
                    placeholder={`${selectedBrand.name} - Produse de calitate la Smart Lock`}
                    maxLength={60}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {brandFormData.meta_title.length}/60 caractere
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={brandFormData.meta_description}
                    onChange={(e) => setBrandFormData((prev: BrandSEOFormData) => ({ ...prev, meta_description: e.target.value }))}
                    placeholder={`Descoperă toate produsele din brand-ul ${selectedBrand.name} disponibile la Smart Lock. Calitate superioară, prețuri competitive și livrare rapidă.`}
                    rows={3}
                    maxLength={160}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    {brandFormData.meta_description.length}/160 caractere
                  </p>
                </div>

                {/* Meta Keywords */}
                <div>
                  <label className="block text-sm font-medium text-neutral-200 mb-1">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={brandFormData.meta_keywords}
                    onChange={(e) => setBrandFormData((prev: BrandSEOFormData) => ({ ...prev, meta_keywords: e.target.value }))}
                    placeholder={`${selectedBrand.name.toLowerCase()}, brand, produse, smart lock, calitate, ${selectedBrand.name.toLowerCase()} produse`}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Cuvinte cheie separate prin virgulă
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBrandSuggestions}
                  className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors"
                >
                  Sugestii Automate
                </button>
                <button
                  onClick={() => {
                    setEditingBrand(null);
                    setSelectedBrand(null);
                  }}
                  className="rounded-md bg-neutral-600 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-500 transition-colors"
                >
                  Anulare
                </button>
                <button
                  onClick={handleSaveBrandSEO}
                  disabled={saving}
                  className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Se salvează...' : 'Salvare SEO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>

 );
};


