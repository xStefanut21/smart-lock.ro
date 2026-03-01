"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Component to display selected option names
function CartItemOption({ optionId, valueId }: { optionId: string; valueId: string }) {
  const [optionName, setOptionName] = useState<string>("");
  const [valueName, setValueName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptionDetails() {
      const supabase = createSupabaseBrowserClient();
      
      try {
        // Fetch option name
        const { data: optionData } = await supabase
          .from('options')
          .select('name')
          .eq('id', optionId)
          .single();
        
        // Fetch value name
        const { data: valueData } = await supabase
          .from('option_values')
          .select('name')
          .eq('id', valueId)
          .single();

        if (optionData) setOptionName(optionData.name);
        if (valueData) setValueName(valueData.name);
      } catch (error) {
        console.error('Error fetching option details:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOptionDetails();
  }, [optionId, valueId]);

  if (loading) {
    return <p className="text-[11px] text-neutral-500">Încărcare opțiune...</p>;
  }

  return (
    <p className="text-[11px] text-neutral-400">
      {optionName}: <span className="text-neutral-300">{valueName}</span>
    </p>
  );
}
import { isValidRoPhone, normalizeRoPhone, sanitizePhone } from "@/lib/phone";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
  color?: string;
  hasInstallation?: boolean;
  installationPrice?: number;
  selectedOptions?: Record<string, string>;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  // date facturare
  const [accountType, setAccountType] = useState<"pf" | "pj">("pf");
  const [companyName, setCompanyName] = useState("");
  const [companyCui, setCompanyCui] = useState("");
  const [companyRegCom, setCompanyRegCom] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingPhone, setBillingPhone] = useState("");
  const [billingLine1, setBillingLine1] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingCounty, setBillingCounty] = useState("");
  const [billingPostal, setBillingPostal] = useState("");

  // adresă livrare
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
  const [shippingLine1, setShippingLine1] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingCounty, setShippingCounty] = useState("");
  const [shippingPostal, setShippingPostal] = useState("");

  const [shippingMethod, setShippingMethod] = useState("courier_standard");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const billingPhoneTouched = billingPhone.length > 0;
  const billingPhoneInvalid = billingPhoneTouched && !isValidRoPhone(billingPhone);

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

  function handleRemove(id: string, color?: string, hasInstallation?: boolean, selectedOptions?: Record<string, string>) {
    console.log('Checkout handleRemove called with:', { id, color, hasInstallation, selectedOptions });
    console.log('Current items:', items);
    const filteredItems = items.filter((item) => !(item.id === id && item.color === color && item.hasInstallation === hasInstallation && JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions || {})));
    console.log('Filtered items:', filteredItems);
    setItems(filteredItems);
  }

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      setItems(JSON.parse(stored));
    }

    async function loadDefaultAddress() {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // încărcăm datele de profil (tip cont, nume, telefon, firmă), dacă există
      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "account_type, full_name, phone, company_name, company_cui, company_reg_com"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        setAccountType((profile.account_type as "pf" | "pj") || "pf");
        if (!billingName) setBillingName(profile.full_name ?? "");
        if (!billingPhone) setBillingPhone(profile.phone ?? "");
        setCompanyName(profile.company_name ?? "");
        setCompanyCui(profile.company_cui ?? "");
        setCompanyRegCom(profile.company_reg_com ?? "");
      }

      const { data: addr } = await supabase
        .from("addresses")
        .select("label, line1, city, county, postal_code, is_default")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (addr) {
        setBillingLine1(addr.line1);
        setBillingCity(addr.city);
        setBillingCounty(addr.county ?? "");
        setBillingPostal(addr.postal_code ?? "");

        setShippingLine1(addr.line1);
        setShippingCity(addr.city);
        setShippingCounty(addr.county ?? "");
        setShippingPostal(addr.postal_code ?? "");
      }
    }

    loadDefaultAddress();
  }, [billingName, billingPhone]);

  function syncCart(next: CartItem[]) {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "cart", newValue: JSON.stringify(next) })
      );
    }
  }

  function handleIncrease(id: string) {
    syncCart(
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function handleDecrease(id: string) {
    syncCart(
      items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  }


  function sanitizePostal(value: string): string {
    // păstrăm doar cifre și limităm la 6 caractere (format cod poștal RO)
    return value.replace(/\D/g, "").slice(0, 6);
  }

  // prețurile din cart sunt în RON; total și transportul sunt exprimate direct în RON
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function computeShippingCost(): number {
    // determinăm județul destinației de livrare
    const rawCounty = (shippingSameAsBilling ? billingCounty : shippingCounty) || "";
    const normalized = rawCounty.trim().toLowerCase();

    if (!normalized) {
      // dacă nu avem încă județ completat, folosim tariful standard
      return 25;
    }

    // București / București sector etc.
    const isBucharest =
      normalized === "bucuresti" ||
      normalized === "bucurești" ||
      normalized.startsWith("bucuresti ") ||
      normalized.startsWith("bucurești ");

    const isIlfov = normalized === "ilfov";

    if (isBucharest || isIlfov) {
      return 0;
    }

    // restul țării – tarif fix (ajustabil)
    return 25;
  }

  const shippingCost = computeShippingCost();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Trebuie să fii autentificat pentru a plasa o comandă.");
      setLoading(false);
      return;
    }

    if (!isValidRoPhone(billingPhone)) {
      setError("Numărul de telefon nu este valid. Exemplu: 07XXXXXXXX");
      setLoading(false);
      return;
    }

    const shippingAddressPayload = {
      line1: shippingSameAsBilling ? billingLine1 : shippingLine1,
      city: shippingSameAsBilling ? billingCity : shippingCity,
      county: shippingSameAsBilling ? billingCounty : shippingCounty,
      postal_code: shippingSameAsBilling ? billingPostal : shippingPostal,
      name: billingName || null,
      phone: billingPhone ? normalizeRoPhone(billingPhone) : null,
      email: user.email || null,
    };

    const billingAddressPayload = {
      line1: billingLine1,
      city: billingCity,
      county: billingCounty,
      postal_code: billingPostal,
      name: billingName || null,
      phone: billingPhone ? normalizeRoPhone(billingPhone) : null,
      email: user.email || null,
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: total + shippingCost,
        shipping_cost: shippingCost,
        vat_amount: 0,
        shipping_address: shippingAddressPayload,
        billing_address: billingAddressPayload,
        shipping_method: shippingMethod,
        payment_provider: paymentMethod,
        payment_reference: null,
        comment: comment || null,
        // snapshot info despre tipul de cont și firmă, dacă este persoană juridică
        account_type: accountType,
        company_name: accountType === "pj" ? companyName || null : null,
        company_cui: accountType === "pj" ? companyCui || null : null,
        company_reg_com: accountType === "pj" ? companyRegCom || null : null,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      setError("Nu am putut salva comanda. Încearcă din nou.");
      setLoading(false);
      return;
    }

    const itemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
      color: item.color ?? null,
      selected_options: item.selectedOptions ?? {},
      has_installation: item.hasInstallation ?? false,
      installation_price: item.installationPrice ?? 0,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsPayload);

    if (itemsError) {
      setError("Comanda a fost creată, dar nu am putut salva produsele.");
      setLoading(false);
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      if (accessToken) {
        const resp = await fetch("/api/order-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ orderId: order.id }),
        });

        if (!resp.ok) {
          const body = await resp.text().catch(() => "");
          // eslint-disable-next-line no-console
          console.warn("order-notification failed", resp.status, body);
        }
      }
    } catch {
      // ignorăm erorile de notificare email; comanda rămâne plasată
    }

    // actualizăm/salvăm profilul cu nume și telefon din facturare
    await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: billingName || null,
          phone: billingPhone ? normalizeRoPhone(billingPhone) : null,
        },
        { onConflict: "id" }
      );

    // salvăm adresele în tabela addresses pentru utilizări viitoare
    const addressesToInsert: any[] = [];

    if (billingLine1 && billingCity) {
      addressesToInsert.push({
        user_id: user.id,
        label: "Facturare",
        line1: billingLine1,
        city: billingCity,
        county: billingCounty || null,
        postal_code: billingPostal || null,
      });
    }

    const shippingLine = shippingSameAsBilling ? billingLine1 : shippingLine1;
    const shippingCityVal = shippingSameAsBilling ? billingCity : shippingCity;
    const shippingCountyVal = shippingSameAsBilling ? billingCounty : shippingCounty;
    const shippingPostalVal = shippingSameAsBilling ? billingPostal : shippingPostal;

    if (shippingLine && shippingCityVal) {
      // evităm să inserăm de două ori exact aceeași adresă
      const sameAsBilling =
        shippingLine === billingLine1 &&
        shippingCityVal === billingCity &&
        (shippingCountyVal || "") === (billingCounty || "") &&
        (shippingPostalVal || "") === (billingPostal || "");

      if (!sameAsBilling) {
        addressesToInsert.push({
          user_id: user.id,
          label: "Livrare",
          line1: shippingLine,
          city: shippingCityVal,
          county: shippingCountyVal || null,
          postal_code: shippingPostalVal || null,
        });
      }
    }

    if (addressesToInsert.length > 0) {
      // evităm să inserăm adrese care există deja pentru utilizator (după linie, oraș, județ, cod poștal)
      const { data: existingAddresses } = await supabase
        .from("addresses")
        .select("line1, city, county, postal_code")
        .eq("user_id", user.id);

      const filteredToInsert = addressesToInsert.filter((addr) => {
        const countyVal = addr.county || null;
        const postalVal = addr.postal_code || null;

        return !existingAddresses?.some((ex: any) => {
          const exCounty = ex.county || null;
          const exPostal = ex.postal_code || null;
          return (
            ex.line1 === addr.line1 &&
            ex.city === addr.city &&
            exCounty === countyVal &&
            exPostal === postalVal
          );
        });
      });

      if (filteredToInsert.length > 0) {
        await supabase.from("addresses").insert(filteredToInsert);
      }
    }

    localStorage.removeItem("cart");
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new StorageEvent("storage", { key: "cart", newValue: null })
      );
    }
    setLoading(false);
    router.push(`/order-confirmation/${order.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold text-white">Checkout</h1>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400">Coșul este gol.</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)]"
        >
          <div className="space-y-4">
            {/* Date facturare */}
            <section className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-xs">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-200">
                Date facturare
              </h2>
              {accountType === "pj" && companyName && (
                <div className="mb-2 space-y-1 rounded-md border border-neutral-800 bg-neutral-900/60 p-3 text-[11px] text-neutral-200">
                  <p className="font-medium text-neutral-100">Cont persoană juridică</p>
                  <p>{companyName}</p>
                  {(companyCui || companyRegCom) && (
                    <p className="text-neutral-300">
                      {companyCui && <span>CUI: {companyCui}</span>}
                      {companyCui && companyRegCom && <span className="mx-1">•</span>}
                      {companyRegCom && <span>Nr. Reg. Com.: {companyRegCom}</span>}
                    </p>
                  )}
                  <p className="text-[10px] text-neutral-400">
                    Dacă datele firmei sunt greșite, le poți actualiza din cont, la pagina
                    "Contul meu".
                  </p>
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300" htmlFor="billingName">
                    Nume complet
                  </label>
                  <input
                    id="billingName"
                    type="text"
                    value={billingName}
                    onChange={(e) => setBillingName(e.target.value)}
                    className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300" htmlFor="billingPhone">
                    Telefon
                  </label>
                  <input
                    id="billingPhone"
                    type="tel"
                    value={billingPhone}
                    onChange={(e) => setBillingPhone(sanitizePhone(e.target.value))}
                    className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                  />
                  {billingPhoneInvalid && (
                    <p className="text-[11px] text-red-400">
                      Numărul de telefon nu este valid. Exemplu: 07XXXXXXXX
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-neutral-300" htmlFor="billingLine1">
                    Stradă și număr
                  </label>
                  <input
                    id="billingLine1"
                    type="text"
                    value={billingLine1}
                    onChange={(e) => setBillingLine1(e.target.value)}
                    required
                    className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300" htmlFor="billingCity">
                    Oraș
                  </label>
                  <input
                    id="billingCity"
                    type="text"
                    value={billingCity}
                    onChange={(e) => setBillingCity(e.target.value)}
                    required
                    className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300" htmlFor="billingCounty">
                    Județ
                  </label>
                  <select
                    id="billingCounty"
                    value={billingCounty}
                    onChange={(e) => setBillingCounty(e.target.value)}
                    className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                  >
                    <option value="">Selectează județul</option>
                    {romanianCounties.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-neutral-300" htmlFor="billingPostal">
                    Cod poștal
                  </label>
                  <input
                    id="billingPostal"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    value={billingPostal}
                    onChange={(e) => setBillingPostal(sanitizePostal(e.target.value))}
                    className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Adresă livrare */}
            <section className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-xs">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-200">
                Altă adresă de livrare
              </h2>
              <label className="mb-1 flex items-center gap-2 text-neutral-300">
                <input
                  type="checkbox"
                  checked={shippingSameAsBilling}
                  onChange={(e) => setShippingSameAsBilling(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-950 text-blue-600"
                />
                <span>Folosesc aceleași date ca la facturare</span>
              </label>
              {!shippingSameAsBilling && (
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-neutral-300" htmlFor="shippingLine1">
                      Stradă și număr
                    </label>
                    <input
                      id="shippingLine1"
                      type="text"
                      value={shippingLine1}
                      onChange={(e) => setShippingLine1(e.target.value)}
                      required
                      className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-neutral-300" htmlFor="shippingCity">
                      Oraș
                    </label>
                    <input
                      id="shippingCity"
                      type="text"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      required
                      className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-neutral-300" htmlFor="shippingCounty">
                      Județ
                    </label>
                    <select
                      id="shippingCounty"
                      value={shippingCounty}
                      onChange={(e) => setShippingCounty(e.target.value)}
                      className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                    >
                      <option value="">Selectează județul</option>
                      {romanianCounties.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-neutral-300" htmlFor="shippingPostal">
                      Cod poștal
                    </label>
                    <input
                      id="shippingPostal"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      value={shippingPostal}
                      onChange={(e) => setShippingPostal(sanitizePostal(e.target.value))}
                      className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-neutral-100 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Rezumat produse */}
            <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-xs text-neutral-300">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-200">
                Rezumat produse
              </h2>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={`${item.id}-${item.color ?? "_"}-${item.hasInstallation ? "with-install" : "no-install"}-${JSON.stringify(item.selectedOptions || {})}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-neutral-800 bg-neutral-900">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[9px] text-neutral-500">Fără imagine</span>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] text-neutral-100">{item.name}</p>
                        {item.color && (
                          <p className="text-[11px] text-neutral-400">Culoare: {item.color}</p>
                        )}
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <div className="mt-1 space-y-1">
                            {Object.entries(item.selectedOptions).map(([optionId, valueId]) => (
                              <CartItemOption key={`${optionId}-${valueId}`} optionId={optionId} valueId={valueId} />
                            ))}
                          </div>
                        )}
                        <p className="text-[11px] text-neutral-400">
                          {new Intl.NumberFormat("ro-RO", {
                            style: "currency",
                            currency: "RON",
                          }).format(item.price)} / buc
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-md border border-neutral-700 bg-neutral-900 text-xs">
                        <button
                          type="button"
                          onClick={() => handleDecrease(item.id)}
                          className="flex h-7 w-7 items-center justify-center border-r border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        >
                          −
                        </button>
                        <div className="flex h-7 w-9 items-center justify-center text-sm text-white">
                          {item.quantity}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleIncrease(item.id)}
                          className="flex h-7 w-7 items-center justify-center border-l border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] text-neutral-100">
                          {new Intl.NumberFormat("ro-RO", {
                            style: "currency",
                            currency: "RON",
                          }).format(item.price * item.quantity)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id, item.color, item.hasInstallation, item.selectedOptions)}
                        className="ml-1 text-xs text-red-400 hover:text-red-300"
                        aria-label="Șterge produsul din coș"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="space-y-4">
            {/* Metoda de livrare */}
            <section className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-xs text-neutral-200">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-200">
                Metoda de livrare
              </h2>
              <label className="flex items-start gap-2 text-neutral-300">
                <input
                  type="radio"
                  name="shipping-method"
                  checked={shippingMethod === "courier_standard"}
                  onChange={() => setShippingMethod("courier_standard")}
                  className="mt-0.5 h-3.5 w-3.5 rounded-full border-neutral-700 bg-neutral-950 text-blue-600"
                />
                <span>
                  Curier standard (24-48h) – cost calculat după adresa de livrare: {" "}
                  {new Intl.NumberFormat("ro-RO", {
                    style: "currency",
                    currency: "RON",
                  }).format(shippingCost)}
                </span>
              </label>
            </section>

            {/* Metoda de plată */}
            <section className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-xs text-neutral-200">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-neutral-200">
                Metoda de plată
              </h2>
              <label className="flex items-start gap-2 text-neutral-300">
                <input
                  type="radio"
                  name="payment-method"
                  checked={paymentMethod === "cash_on_delivery"}
                  onChange={() => setPaymentMethod("cash_on_delivery")}
                  className="mt-0.5 h-3.5 w-3.5 rounded-full border-neutral-700 bg-neutral-950 text-blue-600"
                />
                <span>
                  Plata la livrare (ramburs) – achiți comanda direct la curier.
                </span>
              </label>
            </section>

            {/* Sumar comandă + comentarii */}
            <section className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-sm text-neutral-100">
              <h2 className="text-lg font-medium text-white">Sumar comandă</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Produse</span>
                  <span>
                    {new Intl.NumberFormat("ro-RO", {
                      style: "currency",
                      currency: "RON",
                    }).format(total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transport</span>
                  <span>
                    {new Intl.NumberFormat("ro-RO", {
                      style: "currency",
                      currency: "RON",
                    }).format(shippingCost)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between border-t border-neutral-800 pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat("ro-RO", {
                      style: "currency",
                      currency: "RON",
                    }).format(total + shippingCost)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-neutral-300">
                <label className="flex flex-col gap-1">
                  <span>Adaugă comentarii despre comanda ta</span>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="h-20 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-blue-500"
                  />
                </label>

                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-950 text-blue-600"
                  />
                  <span>
                    Confirm că am citit și sunt de acord cu {" "}
                    <Link
                      href="/termeni-si-conditii"
                      className="text-blue-400 underline-offset-2 hover:text-blue-300 hover:underline"
                    >
                      termenii și condițiile
                    </Link>{" "}
                    magazinului smart-lock.ro.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-auto w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {loading ? "Se procesează comanda..." : "Plasează comanda"}
              </button>
            </section>
          </div>
        </form>
      )}
    </div>
  );
}
