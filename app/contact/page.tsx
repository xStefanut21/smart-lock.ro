"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [startedAt, setStartedAt] = useState<number>(0);
  const [captchaA, setCaptchaA] = useState<number>(0);
  const [captchaB, setCaptchaB] = useState<number>(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const expectedCaptcha = useMemo(() => captchaA + captchaB, [captchaA, captchaB]);

  useEffect(() => {
    setIsMounted(true);
    setStartedAt(Date.now());
    refreshCaptcha();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshCaptcha() {
    setCaptchaA(1 + Math.floor(Math.random() * 9));
    setCaptchaB(1 + Math.floor(Math.random() * 9));
    setCaptchaAnswer("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);

    if (name.trim().length < 2 || name.trim().length > 80) {
      setLoading(false);
      setError("Numele trebuie să aibă între 2 și 80 caractere.");
      return;
    }

    if (subject.trim().length > 120) {
      setLoading(false);
      setError("Subiectul trebuie să aibă maxim 120 caractere.");
      return;
    }

    if (!phone.trim()) {
      setLoading(false);
      setError("Numărul de telefon este obligatoriu.");
      return;
    }

    // Validare strictă pentru telefon românesc
    const phoneRegex = /^(\+4|0)?7[0-9]{8}$/;
    const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
      setLoading(false);
      setError("Numărul de telefon nu este valid. Introdu un număr românesc valid (ex: 0741119449 sau +40741119449).");
      return;
    }

    const msgLen = message.trim().length;
    if (msgLen < 20 || msgLen > 2000) {
      setLoading(false);
      setError("Mesajul trebuie să aibă între 20 și 2000 caractere.");
      return;
    }

    if (!isMounted) {
      setLoading(false);
      setError("Te rog reîncarcă pagina și încearcă din nou.");
      return;
    }

    if (Number(captchaAnswer) !== expectedCaptcha) {
      setLoading(false);
      setError("Captcha invalid. Te rog încearcă din nou.");
      refreshCaptcha();
      return;
    }

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
        honeypot: honeypot.trim(),
        elapsedMs: Date.now() - startedAt,
      }),
    });

    const data = (await res.json().catch(() => null)) as any;
    setLoading(false);

    if (!res.ok) {
      setError(data?.error || "Nu am putut trimite mesajul. Încearcă din nou.");
      return;
    }

    setSubmitted(true);
    setName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
    setCaptchaAnswer("");
    refreshCaptcha();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-neutral-200">
      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
        Acasă / Contact
      </p>
      <h1 className="mb-2 text-3xl font-semibold text-white">Contactează-ne</h1>

      <div className="mb-8 flex flex-col gap-6 text-xs text-neutral-300 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="mb-1 text-[13px] font-semibold text-neutral-200">
            Locația noastră
          </p>
          <p>București, România</p>
          <p className="mt-2">Email: stefan.prodan@monvelli.ro</p>
          <p>Telefon: 0741119449</p>
        </div>
        <div className="text-right md:text-left">
          <p className="mb-1 text-[13px] font-semibold text-neutral-200">
            Program relații clienți
          </p>
          <p>Luni - Vineri: 09:00 - 17:00</p>
          <p className="text-neutral-500">Sâmbătă / Duminică: doar email</p>
        </div>
      </div>

      <h2 className="mb-3 text-base font-medium text-white">Formular de contact</h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-950/70 p-6"
      >
        {error && (
          <p className="rounded-md border border-red-700 bg-red-950/40 px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}
        {submitted && (
          <p className="rounded-md border border-green-700 bg-green-950/40 px-3 py-2 text-xs text-green-300">
            Mesajul a fost trimis. Vom reveni în cel mai scurt timp.
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-300" htmlFor="name">
              Nume
            </label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-100 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              maxLength={320}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-100 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-300" htmlFor="phone">
            Telefon *
          </label>
          <input
            id="phone"
            type="tel"
            required
            maxLength={20}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="ex: 0741119449"
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-100 outline-none focus:border-blue-500"
          />
          <p className="text-[10px] text-neutral-500">
            Format valid: 07xxxxxxxx sau +407xxxxxxxx
          </p>
        </div>

        <div className="hidden">
          <label className="text-xs font-medium text-neutral-300" htmlFor="website">
            Website
          </label>
          <input
            id="website"
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            autoComplete="off"
            tabIndex={-1}
            className="h-9 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-300" htmlFor="subject">
            Subiect
          </label>
          <input
            id="subject"
            type="text"
            maxLength={120}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-100 outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-300" htmlFor="message">
            Mesaj
          </label>
          <textarea
            id="message"
            required
            minLength={20}
            maxLength={2000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[140px] rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-blue-500"
          />
          <p className="text-[11px] text-neutral-500">
            {message.trim().length}/2000 caractere
          </p>
        </div>

        {isMounted && captchaA > 0 && captchaB > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-neutral-300">
                Verificare: cât face <span className="font-semibold text-white">{captchaA} + {captchaB}</span>?
              </p>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="rounded border border-neutral-700 px-2 py-1 text-[11px] text-neutral-300 hover:border-white hover:text-white"
              >
                Reîncarcă
              </button>
            </div>
            <input
              type="number"
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              className="h-9 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-100 outline-none focus:border-blue-500"
              placeholder="Răspuns"
              required
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-9 w-full animate-pulse rounded-md border border-neutral-800 bg-neutral-950/70" />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-red-600 px-6 py-2 text-xs font-medium text-white hover:bg-red-500 disabled:opacity-60"
        >
          {loading ? "Se trimite..." : "Trimite"}
        </button>
      </form>
    </div>
  );
}
