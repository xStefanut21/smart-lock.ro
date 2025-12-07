"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminNewBannerPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/admin/banners/new");
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
    }

    checkAdmin();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createSupabaseBrowserClient();

    if (!imageFile) {
      setError("Te rog selectează o imagine pentru banner.");
      setSaving(false);
      return;
    }

    const numericSort = Number(sortOrder || "1");
    if (Number.isNaN(numericSort)) {
      setError("Te rog introdu o valoare numerică validă pentru ordinea de afișare.");
      setSaving(false);
      return;
    }

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("home_banner_images")
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
    } = supabase.storage.from("home_banner_images").getPublicUrl(filePath);

    const finalImageUrl = publicUrl || null;

    if (!finalImageUrl) {
      setError("Nu am putut obține URL-ul public pentru imagine.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("home_banners").insert({
      title: title.trim() || null,
      subtitle: subtitle.trim() || null,
      image_url: finalImageUrl,
      link_url: linkUrl.trim() || null,
      sort_order: numericSort,
      is_active: isActive,
    });

    setSaving(false);

    if (insertError) {
      setError(
        `Nu am putut salva bannerul: ${insertError.message || "eroare necunoscută"}`
      );
      return;
    }

    router.push("/admin/banners");
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
        ← Înapoi la liste de bannere
      </button>
      <h1 className="mb-4 text-lg font-semibold text-white">Adaugă banner nou</h1>
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
          <label className="text-neutral-300" htmlFor="imageFile">
            Imagine banner
          </label>
          <input
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-100 outline-none file:mr-2 file:rounded-md file:border-0 file:bg-neutral-800 file:px-3 file:py-1 file:text-xs file:text-neutral-100 focus:border-red-500"
          />
          <p className="text-[11px] text-neutral-500">
            Imaginea va fi încărcată în Supabase Storage, bucket "home_banner_images".
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="title">
            Titlu (opțional)
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="subtitle">
            Subtitlu (opțional)
          </label>
          <input
            id="subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="linkUrl">
            Link (opțional)
          </label>
          <input
            id="linkUrl"
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/products" 
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-red-500"
          />
          <p className="text-[11px] text-neutral-500">
            Dacă este completat, click pe banner va duce către acest URL.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-neutral-300" htmlFor="sortOrder">
              Ordine afișare
            </label>
            <input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
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
              Banner activ (vizibil pe site)
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-md bg-red-600 px-6 py-2 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-60"
        >
          {saving ? "Se salvează bannerul..." : "Salvează bannerul"}
        </button>
      </form>
    </div>
  );
}
