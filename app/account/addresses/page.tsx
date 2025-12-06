"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Address {
  id: string;
  label: string | null;
  line1: string;
  city: string;
  county: string | null;
  postal_code: string | null;
  is_default: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("addresses")
        .select("id, label, line1, city, county, postal_code, is_default")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setAddresses((data as Address[]) ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        label: label || null,
        line1,
        city,
        county: county || null,
        postal_code: postalCode || null,
      })
      .select("id, label, line1, city, county, postal_code, is_default")
      .single();

    setSaving(false);

    if (insertError || !data) {
      setError("Nu am putut salva adresa. Încearcă din nou.");
      return;
    }

    setAddresses((prev) => [data as Address, ...prev]);
    setLabel("");
    setLine1("");
    setCity("");
    setCounty("");
    setPostalCode("");
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Ești sigur că vrei să ștergi această adresă?")) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: deleteError } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      setError("Nu am putut șterge adresa. Încearcă din nou.");
      return;
    }

    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  }

  async function handleSetDefault(id: string) {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // mai întâi resetăm implicitul pentru celelalte adrese ale utilizatorului
    const { error: clearError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    if (clearError) {
      setError("Nu am putut actualiza adresele implicite. Încearcă din nou.");
      return;
    }

    const { error: setErrorDefault } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (setErrorDefault) {
      setError("Nu am putut seta adresa implicită. Încearcă din nou.");
      return;
    }

    setAddresses((prev) =>
      prev.map((addr) => ({ ...addr, is_default: addr.id === id }))
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă adresele tale...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-neutral-200">
      <h1 className="mb-4 text-3xl font-semibold text-white">Adresele mele</h1>

      <form
        onSubmit={handleAdd}
        className="mb-6 space-y-3 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 text-xs"
      >
        <h2 className="text-sm font-medium text-white">Adaugă o adresă nouă</h2>
        {error && (
          <p className="rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-red-300">
            {error}
          </p>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-neutral-300" htmlFor="label">
              Etichetă (ex. Acasă, Birou)
            </label>
            <input
              id="label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-neutral-300" htmlFor="line1">
              Stradă și număr
            </label>
            <input
              id="line1"
              type="text"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              required
              className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-neutral-300" htmlFor="city">
              Oraș
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-neutral-300" htmlFor="county">
              Județ
            </label>
            <input
              id="county"
              type="text"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-neutral-300" htmlFor="postalCode">
              Cod poștal
            </label>
            <input
              id="postalCode"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-md bg-blue-600 px-6 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {saving ? "Se adaugă..." : "Salvează adresa"}
        </button>
      </form>

      <section className="space-y-2 text-xs text-neutral-300">
        <h2 className="text-sm font-medium text-white">Adrese salvate</h2>
        {addresses.length === 0 ? (
          <p className="text-neutral-400">
            Nu ai adrese salvate încă. Poți adăuga una folosind formularul de mai sus.
          </p>
        ) : (
          <ul className="space-y-2">
            {addresses.map((addr) => (
              <li
                key={addr.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950/70 p-3"
              >
                <div>
                  <p className="font-medium text-neutral-100">
                    {addr.label || "Adresă"}
                    {addr.is_default && (
                      <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Implicit
                      </span>
                    )}
                  </p>
                  <p>
                    {addr.line1}, {addr.city}
                    {addr.county ? `, ${addr.county}` : ""}
                  </p>
                  {addr.postal_code && <p>Cod poștal: {addr.postal_code}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  {!addr.is_default && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="rounded-md border border-blue-700 px-3 py-1 text-[11px] text-blue-400 hover:bg-blue-700/20"
                    >
                      Setează ca implicită
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="rounded-md border border-red-700 px-3 py-1 text-[11px] text-red-400 hover:bg-red-700/20"
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
