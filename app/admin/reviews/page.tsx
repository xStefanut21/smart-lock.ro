"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AdminReview {
  id: string;
  content: string;
  created_at: string;
  product_id: string;
  is_approved?: boolean | null;
  products?: {
    name: string | null;
    slug: string | null;
  } | null;
  profiles?: {
    full_name?: string | null;
  } | null;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/admin/reviews");
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

      const { data, error } = await supabase
        .from("product_reviews")
        .select("id, content, created_at, product_id, is_approved, products(name, slug), profiles(full_name)")
        .order("is_approved", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        setError("Nu am putut încărca review-urile. Încearcă din nou.");
        setLoading(false);
        return;
      }

      const normalized: AdminReview[] = (data ?? []).map((row: any) => ({
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        product_id: row.product_id,
        is_approved: row.is_approved ?? null,
        products: row.products ?? null,
        profiles: row.profiles ?? null,
      }));

      setReviews(normalized);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleDelete(review: AdminReview) {
    if (!review.id) return;
    if (!confirm("Sigur vrei să ștergi acest review?")) return;

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", review.id);

    if (error) {
      setError(error.message || "Nu am putut șterge review-ul.");
      return;
    }

    setReviews((prev) => prev.filter((r) => r.id !== review.id));
    setSuccess("Review-ul a fost șters.");
  }

  async function handleApprove(review: AdminReview) {
    if (!review.id) return;

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase
      .from("product_reviews")
      .update({ is_approved: true })
      .eq("id", review.id);

    if (error) {
      setError(error.message || "Nu am putut aproba review-ul.");
      return;
    }

    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, is_approved: true } : r))
    );
    setSuccess("Review-ul a fost aprobat.");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-neutral-100">
      <h1 className="mb-2 text-2xl font-semibold text-white">Administrare review-uri</h1>
      <p className="mb-4 text-xs text-neutral-400">
        Aici poți vedea toate review-urile lăsate de clienți și le poți șterge pe cele nepotrivite.
      </p>

      {error && (
        <div className="mb-3 rounded-md border border-red-500 bg-red-900/20 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 rounded-md border border-emerald-600 bg-emerald-900/20 px-3 py-2 text-xs text-emerald-200">
          {success}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-neutral-400">Se încarcă review-urile...</p>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-neutral-400">Nu există review-uri în acest moment.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950/80 p-3 md:flex-row md:items-start md:justify-between"
            >
              <div className="space-y-1 text-xs md:text-sm">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                  <span className="font-medium text-neutral-100">
                    {review.profiles?.full_name || "Client smart-lock.ro"}
                  </span>
                  <span className="h-3 w-px bg-neutral-700" />
                  <span>
                    {new Date(review.created_at).toLocaleString("ro-RO", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {review.products && (
                    <>
                      <span className="h-3 w-px bg-neutral-700" />
                      <a
                        href={review.products.slug ? `/products/${review.products.slug}` : "#"}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {review.products.name || "Produs"}
                      </a>
                    </>
                  )}
                  <span className="h-3 w-px bg-neutral-700" />
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      review.is_approved
                        ? "bg-emerald-900/40 text-emerald-300 border border-emerald-700/60"
                        : "bg-yellow-900/40 text-yellow-200 border border-yellow-700/60"
                    }`}
                  >
                    {review.is_approved ? "Aprobat" : "În așteptare"}
                  </span>
                </div>
                <p className="whitespace-pre-line break-words text-xs md:text-sm text-neutral-100">
                  {review.content}
                </p>
              </div>

              <div className="mt-2 flex items-center gap-2 md:mt-0 md:flex-col md:items-end">
                {!review.is_approved && (
                  <button
                    type="button"
                    onClick={() => handleApprove(review)}
                    className="rounded-md border border-emerald-600 px-3 py-1 text-[11px] font-medium text-emerald-200 hover:bg-emerald-900/40"
                  >
                    Acceptă review
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(review)}
                  className="rounded-md border border-red-600 px-3 py-1 text-[11px] font-medium text-red-200 hover:bg-red-900/40"
                >
                  Refuză / Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
