"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminUsersPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login?redirect=/admin/users");
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

  async function submit(isAdmin: boolean) {
    setLoading(true);
    setMessage(null);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const token = session?.access_token;

    if (!token) {
      setLoading(false);
      setError("Nu ești autentificat.");
      return;
    }

    const res = await fetch("/api/admin/set-admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: email.trim(), isAdmin }),
    });

    const data = (await res.json().catch(() => null)) as any;

    setLoading(false);

    if (!res.ok) {
      setError(data?.error || "Nu am putut actualiza drepturile.");
      return;
    }

    setMessage(
      isAdmin
        ? `Am acordat drepturi de admin pentru ${email.trim()}.`
        : `Am revocat drepturile de admin pentru ${email.trim()}.`
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
      <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">
              Administrare utilizatori
            </h1>
            <p className="text-xs text-neutral-400">
              Acordă sau revocă drepturi de administrator unui cont.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="mt-4 rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-medium text-neutral-200 hover:border-white hover:text-white md:mt-0"
          >
            Înapoi la panou
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6"
      >
        {message && (
          <div className="rounded-md border border-green-700 bg-green-950/40 px-3 py-2 text-xs text-green-300">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        <label className="block text-xs text-neutral-300">
          Email utilizator
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            placeholder="ex: user@domain.com"
            required
          />
        </label>

        <div className="flex flex-col gap-2 md:flex-row">
          <button
            type="button"
            disabled={loading}
            onClick={() => submit(true)}
            className="rounded-md bg-blue-600 px-5 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {loading ? "Se procesează..." : "Acordă admin"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => submit(false)}
            className="rounded-md bg-neutral-800 px-5 py-2 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-60"
          >
            {loading ? "Se procesează..." : "Revocă admin"}
          </button>
        </div>

        <div className="text-[11px] text-neutral-500">
          Atenție: contul trebuie să existe deja (să fie înregistrat). Revocarea propriului acces este blocată ca să nu te blochezi singur.
        </div>
      </form>
    </div>
  );
}
