"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitted(false);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
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
    setSubject("");
    setMessage("");
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
          <p className="mt-2">Email: contact@smart-lock.ro</p>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-xs text-neutral-100 outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-300" htmlFor="subject">
            Subiect
          </label>
          <input
            id="subject"
            type="text"
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
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[140px] rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-blue-500"
          />
        </div>
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
