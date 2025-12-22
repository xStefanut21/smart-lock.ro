"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isValidRoPhone, normalizeRoPhone, sanitizePhone } from "@/lib/phone";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountType, setAccountType] = useState<"pf" | "pj">("pf");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cui, setCui] = useState("");
  const [regCom, setRegCom] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const phoneTouched = phone.length > 0;
  const phoneInvalid = phoneTouched && !isValidRoPhone(phone);

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
        .from("profiles")
        .select(
          "account_type, full_name, phone, company_name, company_cui, company_reg_com"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setAccountType((data.account_type as "pf" | "pj") || "pf");
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setCompanyName(data.company_name ?? "");
        setCui(data.company_cui ?? "");
        setRegCom(data.company_reg_com ?? "");
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    if (phone && !isValidRoPhone(phone)) {
      setSaving(false);
      setError("Numărul de telefon nu este valid. Exemplu: 07XXXXXXXX");
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

    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        account_type: accountType,
        full_name: fullName || null,
        phone: phone ? normalizeRoPhone(phone) : null,
        company_name: accountType === "pj" ? companyName || null : null,
        company_cui: accountType === "pj" ? cui || null : null,
        company_reg_com: accountType === "pj" ? regCom || null : null,
      },
      { onConflict: "id" }
    );

    setSaving(false);

    if (upsertError) {
      setError("Nu am putut salva profilul. Încearcă din nou.");
      return;
    }

    setMessage("Profil actualizat cu succes.");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-neutral-200">
        Se încarcă datele profilului...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-neutral-200">
      <h1 className="mb-4 text-3xl font-semibold text-white">Editează informațiile contului</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 text-xs"
      >
        {message && (
          <p className="rounded-md border border-green-700 bg-green-950/40 px-3 py-2 text-green-300">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-red-300">
            {error}
          </p>
        )}
        <div className="space-y-3">
          <div className="flex gap-3 text-[11px] text-neutral-300">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="account-type"
                value="pf"
                checked={accountType === "pf"}
                onChange={() => setAccountType("pf")}
                className="h-3.5 w-3.5 rounded-full border-neutral-700 bg-neutral-950 text-blue-600"
              />
              <span>Persoană fizică</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="account-type"
                value="pj"
                checked={accountType === "pj"}
                onChange={() => setAccountType("pj")}
                className="h-3.5 w-3.5 rounded-full border-neutral-700 bg-neutral-950 text-blue-600"
              />
              <span>Persoană juridică</span>
            </label>
          </div>

          {accountType === "pj" && (
            <div className="space-y-2 rounded-md border border-neutral-800 bg-neutral-950/60 p-3">
              <div className="flex flex-col gap-1">
                <label className="text-neutral-300" htmlFor="companyName">
                  Nume companie
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300" htmlFor="cui">
                    CUI
                  </label>
                  <input
                    id="cui"
                    type="text"
                    value={cui}
                    onChange={(e) => setCui(e.target.value)}
                    className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300" htmlFor="regCom">
                    Nr. Reg. Com.
                  </label>
                  <input
                    id="regCom"
                    type="text"
                    value={regCom}
                    onChange={(e) => setRegCom(e.target.value)}
                    className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="fullName">
            Nume complet
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-neutral-300" htmlFor="phone">
            Telefon
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(sanitizePhone(e.target.value))}
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
          />
          {phoneInvalid && (
            <p className="text-[11px] text-red-400">
              Numărul de telefon nu este valid. Exemplu: 07XXXXXXXX
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-md bg-blue-600 px-6 py-2 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {saving ? "Se salvează..." : "Salvează modificările"}
        </button>
      </form>
    </div>
  );
}
