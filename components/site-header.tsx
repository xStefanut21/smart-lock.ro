"use client";

import { useState } from "react";
import { NavCartIndicator } from "@/components/nav-cart-indicator";
import { UserNav } from "@/components/user-nav";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-b border-neutral-800 bg-black/90 shadow-[0_10px_25px_rgba(0,0,0,0.6)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-sm md:px-8 md:py-5">
        <a
          href="/"
          className="text-[15px] font-semibold tracking-tight text-white"
          onClick={() => setMobileOpen(false)}
        >
          smart-lock.ro
        </a>

        {/* Nav desktop */}
        <nav className="hidden flex-1 items-center justify-center gap-9 text-[14px] font-medium md:flex">
          <a href="/" className="text-neutral-200 hover:text-white">
            Acasă
          </a>
          <a href="/products" className="text-neutral-200 hover:text-white">
            Produse
          </a>
          <a href="/services" className="text-neutral-200 hover:text-white">
            Servicii
          </a>
          <a href="/about" className="text-neutral-200 hover:text-white">
            Despre noi
          </a>
          <a href="/contact" className="text-neutral-200 hover:text-white">
            Contact
          </a>
        </nav>

        {/* Icon-uri + burger */}
        <div className="flex items-center gap-3 text-neutral-200 md:gap-5">
          {/* placeholder pentru wishlist */}
          <button
            type="button"
            className="relative hidden h-8 w-8 items-center justify-center hover:text-white sm:flex"
            aria-label="Favorite (în curând)"
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
              <path d="M12 19s-4.5-2.7-6.7-5C3.2 11.8 3 9.2 4.5 7.6 5.9 6 8.3 6.2 9.7 7.6L12 9.9l2.3-2.3c1.4-1.4 3.8-1.6 5.2 0 1.5 1.6 1.3 4.2-.8 6.4-2.2 2.3-6.7 5-6.7 5z" />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-semibold text-white">
              0
            </span>
          </button>
          <NavCartIndicator />
          <UserNav />

          {/* Burger mobil */}
          <button
            type="button"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-md border border-neutral-700 hover:border-white hover:text-white md:hidden"
            aria-label="Deschide meniul"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            <span className="sr-only">Meniu</span>
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
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Meniu mobil */}
      {mobileOpen && (
        <nav className="border-t border-neutral-800 bg-black/95 text-sm text-neutral-200 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            <a
              href="/"
              className="py-2 text-neutral-200 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Acasă
            </a>
            <a
              href="/products"
              className="py-2 text-neutral-200 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Produse
            </a>
            <a
              href="/services"
              className="py-2 text-neutral-200 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Servicii
            </a>
            <a
              href="/about"
              className="py-2 text-neutral-200 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Despre noi
            </a>
            <a
              href="/contact"
              className="py-2 text-neutral-200 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
