"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function UserNav() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function loadInitialUser() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      setEmail(user?.email ?? null);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();

        setIsAdmin(profile?.is_admin === true);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    }

    loadInitialUser();

    // ascultăm schimbările de sesiune (login/logout) pentru a actualiza imediat meniul
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      const user = session?.user ?? null;
      setEmail(user?.email ?? null);

      if (user) {
        supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            setIsAdmin(profile?.is_admin === true);
          });
      } else {
        setIsAdmin(false);
      }
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
    setIsAdmin(false);
    router.push("/");
  }

  function handleToggle() {
    setOpen((prev) => !prev);
  }

  return (
    <div className="relative text-xs text-neutral-200">
      <button
        type="button"
        onClick={handleToggle}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-white hover:text-white"
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

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-neutral-700 bg-neutral-950/95 p-2 text-xs shadow-lg">
          {email ? (
            <>
              <div className="mb-2 border-b border-neutral-800 pb-2 text-[11px]">
                <p className="font-semibold text-red-400">Salut, dragă utilizator,</p>
                <p className="truncate text-neutral-200">{email}</p>
              </div>
              <ul className="space-y-1 text-neutral-200">
                {isAdmin && (
                  <li>
                    <button
                      type="button"
                      className="w-full text-left font-semibold text-red-400 hover:text-red-300"
                      onClick={() => {
                        setOpen(false);
                        router.push("/admin");
                      }}
                    >
                      Panou admin
                    </button>
                  </li>
                )}
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
            </>
          ) : (
            <div className="space-y-2 text-center text-[11px] text-neutral-300">
              <p className="mb-1 text-neutral-400">Nu ești logat.</p>
              <button
                type="button"
                className="block w-full rounded-md bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700"
                onClick={() => {
                  setOpen(false);
                  router.push("/login");
                }}
              >
                Intră în cont
              </button>
              <button
                type="button"
                className="block w-full rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500"
                onClick={() => {
                  setOpen(false);
                  router.push("/register");
                }}
              >
                Cont nou
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
