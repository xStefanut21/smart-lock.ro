"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function UserNav() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // citire inițială user
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoading(false);
    });

    // ascultăm schimbările de sesiune (login/logout) pentru a actualiza imediat meniul
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setEmail(null);
    setOpen(false);
    router.push("/");
  }

  function handleToggle() {
    if (!email) {
      router.push("/login");
      return;
    }
    setOpen((prev) => !prev);
  }

  return (
    <div className="relative text-xs text-neutral-200">
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-600 hover:border-white hover:text-white"
        aria-label="Meniu utilizator"
      >
        <svg
          aria-hidden
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="3.2" />
          <path d="M6.5 19.2C7.7 16.9 9.7 15.5 12 15.5s4.3 1.4 5.5 3.7" />
        </svg>
      </button>

      {open && email && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-neutral-700 bg-neutral-950/95 p-2 text-xs shadow-lg">
          <div className="mb-2 border-b border-neutral-800 pb-2 text-[11px]">
            <p className="font-semibold text-red-400">Salut, dragă utilizator,</p>
            <p className="truncate text-neutral-200">{email}</p>
          </div>
          <ul className="space-y-1 text-neutral-200">
            <li>
              <button
                type="button"
                className="w-full text-left hover:text-white"
                onClick={() => {
                  setOpen(false);
                  router.push("/account");
                }}
              >
                Contul meu
              </button>
            </li>
            <li>
              <button
                type="button"
                className="w-full text-left hover:text-white"
                onClick={() => {
                  setOpen(false);
                  router.push("/account/orders");
                }}
              >
                Comenzile mele
              </button>
            </li>
            <li>
              <button
                type="button"
                className="w-full text-left hover:text-white"
                onClick={() => {
                  setOpen(false);
                  router.push("/account/addresses");
                }}
              >
                Adresele mele
              </button>
            </li>
            <li>
              <button
                type="button"
                className="w-full text-left hover:text-white"
                onClick={() => {
                  setOpen(false);
                  router.push("/account");
                }}
              >
                Newsletter
              </button>
            </li>
            <li className="mt-1 border-t border-neutral-800 pt-1">
              <button
                type="button"
                className="w-full text-left text-red-400 hover:text-red-300"
                onClick={handleLogout}
              >
                Ieșire din cont
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
