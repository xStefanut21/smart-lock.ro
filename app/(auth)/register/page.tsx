"use client";

import { useState, FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const romanianCounties = [
  "Alba",
  "Arad",
  "Argeș",
  "Bacău",
  "Bihor",
  "Bistrița-Năsăud",
  "Botoșani",
  "Brașov",
  "Brăila",
  "Buzău",
  "Caraș-Severin",
  "Călărași",
  "Cluj",
  "Constanța",
  "Covasna",
  "Dâmbovița",
  "Dolj",
  "Galați",
  "Giurgiu",
  "Gorj",
  "Harghita",
  "Hunedoara",
  "Ialomița",
  "Iași",
  "Ilfov",
  "Maramureș",
  "Mehedinți",
  "Mureș",
  "Neamț",
  "Olt",
  "Prahova",
  "Satu Mare",
  "Sălaj",
  "Sibiu",
  "Suceava",
  "Teleorman",
  "Timiș",
  "Tulcea",
  "Vaslui",
  "Vâlcea",
  "Vrancea",
  "București",
];

function sanitizePostal(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

function sanitizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function isStrongPassword(value: string): boolean {
  // minim 8 caractere, cel puțin 1 literă mare, minim 2 cifre și 1 simbol
  return /^(?=.*[A-Z])(?=(?:.*\d){2,})(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"pf" | "pj">("pf");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cui, setCui] = useState("");
  const [regCom, setRegCom] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [postal, setPostal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const normalizedEmail = email.trim();

    if (!isStrongPassword(password)) {
      setLoading(false);
      setError(
        "Parola trebuie să aibă minim 8 caractere, cel puțin o literă mare, minim 2 cifre și un simbol."
      );
      return;
    }

    if (phone && !/^\d+$/.test(phone)) {
      setLoading(false);
      setError("Numărul de telefon trebuie să conțină doar cifre.");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    if (signUpError || !data.user) {
      setLoading(false);
      setError(signUpError?.message || "Nu am putut crea contul. Încearcă din nou.");
      return;
    }

    // completăm profilul cu tip de cont, nume, telefon și (opțional) date firmă
    await supabase
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          account_type: accountType,
          full_name: fullName || null,
          phone: phone || null,
          company_name: accountType === "pj" ? companyName || null : null,
          company_cui: accountType === "pj" ? cui || null : null,
          company_reg_com: accountType === "pj" ? regCom || null : null,
        },
        { onConflict: "id" }
      );

    // salvăm o adresă principală, dacă a fost completată
    if (addressLine1 && city) {
      await supabase.from("addresses").insert({
        user_id: data.user.id,
        label: "Adresă principală",
        line1: addressLine1,
        city,
        county: county || null,
        postal_code: postal || null,
        is_default: true,
      });
    }

    setLoading(false);
    router.push("/");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-4 rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-sm shadow-lg"
      >
        <h1 className="mb-1 text-2xl font-semibold text-white">Creare cont</h1>
        <p className="mb-3 text-xs text-neutral-400">
          Completează datele de mai jos pentru ca profilul tău să fie gata de comandă
          încă de la prima autentificare.
        </p>
        {error && <p className="rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-xs text-red-300">{error}</p>}

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
            Date de autentificare
          </h2>
          <label className="block text-xs text-neutral-300">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              required
            />
          </label>
          <label className="block text-xs text-neutral-300">
            Parolă
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              required
            />
          </label>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
            Tip client & date personale
          </h2>

          <div className="flex gap-3 text-xs text-neutral-300">
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
              <label className="block text-xs text-neutral-300">
                Nume companie
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  required
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-xs text-neutral-300">
                  CUI
                  <input
                    type="text"
                    value={cui}
                    onChange={(e) => setCui(e.target.value)}
                    className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    required
                  />
                </label>
                <label className="block text-xs text-neutral-300">
                  Nr. Reg. Com.
                  <input
                    type="text"
                    value={regCom}
                    onChange={(e) => setRegCom(e.target.value)}
                    className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                    required
                  />
                </label>
              </div>
            </div>
          )}

          <label className="block text-xs text-neutral-300">
            Nume complet
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              required
            />
          </label>
          <label className="block text-xs text-neutral-300">
            Telefon
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(sanitizePhone(e.target.value))}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            />
          </label>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
            Adresă principală pentru livrare și facturare
          </h2>
          <label className="block text-xs text-neutral-300">
            Stradă și număr
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              required
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-xs text-neutral-300">
              Oraș
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                required
              />
            </label>
            <label className="block text-xs text-neutral-300">
              Județ
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="">Selectează județul</option>
                {romanianCounties.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-xs text-neutral-300">
            Cod poștal
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              value={postal}
              onChange={(e) => setPostal(sanitizePostal(e.target.value))}
              className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Se creează contul..." : "Creează cont"}
        </button>
        <p className="mt-4 text-xs text-neutral-400">
          Ai deja cont? <a href="/login" className="text-blue-400">Intră în cont</a>
        </p>
      </form>
    </div>
  );
}
