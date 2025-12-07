"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("cookieConsent");
    if (stored !== "accepted") {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cookieConsent", "accepted");
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-5xl px-4 pb-4">
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/95 px-4 py-3 text-xs text-neutral-200 shadow-lg">
        <p className="mb-2 text-[11px] text-neutral-300">
          Folosim cookie-uri esențiale pentru funcționarea site-ului (autentificare,
          coș de cumpărături, preferințe de bază). Prin continuarea navigării sau prin
          apăsarea butonului de mai jos îți exprimi acordul pentru utilizarea
          cookie-urilor esențiale.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/confidentialitate"
            className="text-[11px] text-neutral-400 underline-offset-2 hover:text-neutral-200 hover:underline"
          >
            Află mai multe în Politica de Confidențialitate și Cookies
          </a>
          <button
            type="button"
            onClick={handleAccept}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-[11px] font-medium text-white hover:bg-blue-500"
          >
            Accept cookie-urile esențiale
          </button>
        </div>
      </div>
    </div>
  );
}
