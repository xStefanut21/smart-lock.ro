"use client";

import { useState, FormEvent } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const normalizedEmail = email.trim();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-lg"
      >
        <h1 className="mb-4 text-2xl font-semibold text-white">Autentificare</h1>
        {error && (
          <p className="mb-3 text-sm text-red-400">{error}</p>
        )}
        <label className="mb-3 block text-sm text-neutral-300">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
            required
          />
        </label>
        <label className="mb-4 block text-sm text-neutral-300">
          Parolă
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 pr-16 text-sm text-white outline-none focus:border-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center text-neutral-400 hover:text-neutral-200"
              aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
            >
              {showPassword ? (
                // eye-off icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.585 10.585A2 2 0 0012 14a2 2 0 001.414-.586" />
                  <path d="M9.88 4.64A9.77 9.77 0 0112 4c5 0 9 4 10 8- .273 1.094-.78 2.108-1.49 3.01" />
                  <path d="M6.61 6.61C4.42 7.74 2.88 9.61 2 12c.54 1.53 1.5 2.94 2.77 4.12 1.27 1.18 2.82 2.06 4.54 2.53" />
                </svg>
              ) : (
                // eye icon
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Se autentifică..." : "Intră în cont"}
        </button>
        <p className="mt-4 text-xs text-neutral-400">
          Nu ai cont? <a href="/register" className="text-blue-400">Înregistrează-te</a>
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Ai uitat parola? <a href="/reset-password" className="text-blue-400">Resetează parola</a>
        </p>
      </form>
    </div>
  );
}
