"use client";

import { useEffect, useState, FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface Props {
  productId: string;
  slug: string;
  description?: string | null;
}

interface Review {
  id: string;
  content: string;
  created_at: string;
  is_approved?: boolean;
  profiles?: {
    full_name?: string | null;
  } | null;
}

export function ProductDescriptionReviewsTabs({ productId, slug, description }: Props) {
  const [active, setActive] = useState<"description" | "reviews">("description");
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      setLoadingReviews(true);
      const { data } = await supabase
        .from("product_reviews")
        .select("id, content, created_at, is_approved, profiles(full_name)")
        .eq("product_id", productId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (data && Array.isArray(data)) {
        setReviews(data as Review[]);
      }
      setLoadingReviews(false);
    }

    init();
  }, [productId]);

  async function handleSubmitReview(e: FormEvent) {
    e.preventDefault();
    if (!userId || !reviewText.trim()) return;

    setSubmitting(true);
    setError(null);
    setInfo(null);
    const supabase = createSupabaseBrowserClient();

    const { error: insertError } = await supabase
      .from("product_reviews")
      .insert({
        product_id: productId,
        user_id: userId,
        content: reviewText.trim(),
        is_approved: false,
      })
      .select("id")
      .maybeSingle();

    setSubmitting(false);

    if (insertError) {
      setError(
        insertError?.message || "Nu am putut salva review-ul. Încearcă din nou."
      );
      return;
    }

    setReviewText("");
    setActive("reviews");
    setInfo("Îţi mulţumim pentru opinie. Aceasta a fost trimisă către aprobare.");
  }

  const reviewCount = reviews.length;

  return (
    <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/80 p-4 text-sm text-neutral-200">
      <div className="flex border-b border-neutral-800 text-xs">
        <button
          type="button"
          onClick={() => setActive("description")}
          className={`px-4 py-2 font-medium transition-colors ${
            active === "description"
              ? "border-b-2 border-blue-500 text-white"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Descriere
        </button>
        <button
          type="button"
          onClick={() => setActive("reviews")}
          className={`px-4 py-2 font-medium transition-colors ${
            active === "reviews"
              ? "border-b-2 border-blue-500 text-white"
              : "text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Reviews ({reviewCount})
        </button>
      </div>

      <div className="mt-4 text-xs md:text-sm">
        {active === "description" ? (
          description ? (
            <MarkdownRenderer content={description} />
          ) : (
            <p className="text-neutral-400">
              Nu există încă o descriere detaliată pentru acest produs.
            </p>
          )
        ) : (
          <div className="space-y-4">
            {loadingReviews ? (
              <p className="text-xs text-neutral-400">Se încarcă review-urile...</p>
            ) : reviewCount === 0 ? (
              <p className="text-xs text-neutral-400">
                Nu sunt încă review-uri pentru acest produs.
              </p>
            ) : (
              <ul className="space-y-3 text-xs md:text-sm">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-lg border border-neutral-800 bg-black/40 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="font-medium text-neutral-200">
                        {review.profiles?.full_name || "Client smart-lock.ro"}
                      </span>
                      <span>
                        {new Date(review.created_at).toLocaleDateString("ro-RO")}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-neutral-100 whitespace-pre-line">
                      {review.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            {info && (
              <p className="text-[11px] text-emerald-300">{info}</p>
            )}

            {userId ? (
              <form
                onSubmit={handleSubmitReview}
                className="mt-2 space-y-2 rounded-lg border border-neutral-800 bg-black/30 p-3 text-xs md:text-sm"
              >
                <label className="block text-[11px] font-medium text-neutral-300" htmlFor="review-text">
                  Spune-ți părerea despre acest produs
                </label>
                <textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-blue-500 md:text-sm"
                  placeholder="Scrie aici experiența ta cu acest produs..."
                />
                {error && (
                  <p className="text-[11px] text-red-400">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={submitting || !reviewText.trim()}
                  className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50 md:text-sm"
                >
                  {submitting ? "Se trimite..." : "Trimite review"}
                </button>
              </form>
            ) : (
              <div className="mt-2 space-y-2 rounded-lg border border-neutral-800 bg-black/20 p-3 text-[11px] text-neutral-300">
                <p>
                  Pentru a adăuga un review, te rugăm să te autentifici sau să îți creezi un
                  cont nou.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/login?redirect=/products/${slug}`}
                    className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-100 hover:border-blue-500 hover:text-white"
                  >
                    Autentifică-te
                  </a>
                  <a
                    href={`/register?redirect=/products/${slug}`}
                    className="rounded-md border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-100 hover:border-blue-500 hover:text-white"
                  >
                    Înregistrează un cont nou
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
