"use client";

import { LogIn, Menu, Package, Store as StoreIcon, Tag, X } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { getSignInUrl, getSignupAsStoreOwnerUrl } from "@/lib/oja-links";
import SearchBox from "./SearchBox";

/**
 * Adapted for Oja Square: React Router → Next.js, auth/sell hand off to
 * `app.useoja.com`, product/store suggestions land on storefronts (no
 * marketplace cart). Logo is the icon mark only, not the full wordmark —
 * "Oja Square" is set as text next to it (the wordmark image already
 * spells out "Oja," so pairing it with the icon avoided the redundant
 * "Oja … Oja Square" read). No account icon: this app has no session/auth
 * of its own by design (browsing is anonymous end to end — see
 * `oja-docs/OJA_MARKETPLACE_FEATURE.md` §2.1c), so a profile icon here
 * only pointed at a page for a session Oja Square never establishes;
 * "Log in" is an honest plain link to where that actually lives instead.
 */
export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-teal-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/oja-logo-trans-icon.png"
              alt="Oja"
              className="h-8 w-8"
            />
            <span className="oja-display text-lg font-800 tracking-tight text-gray-900">
              Oja Square
            </span>
          </Link>

          <div className="ml-4 hidden items-center gap-6 lg:flex">
            <Link
              href="/products"
              className="text-sm font-semibold text-gray-700 transition-colors hover:text-teal-600"
            >
              Products
            </Link>
            <Link
              href="/stores"
              className="text-sm font-semibold text-gray-700 transition-colors hover:text-teal-600"
            >
              Stores
            </Link>
            <Link
              href="/categories"
              className="text-sm font-semibold text-gray-700 transition-colors hover:text-teal-600"
            >
              Categories
            </Link>
          </div>

          <Suspense fallback={<SearchBoxFallback className="hidden md:flex" />}>
            <SearchBox className="hidden max-w-2xl md:flex" />
          </Suspense>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={getSignInUrl()}
              className="hidden text-sm font-semibold text-gray-700 transition-colors hover:text-teal-600 sm:block"
            >
              Log in
            </a>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 lg:hidden"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <a
              href={getSignupAsStoreOwnerUrl()}
              className="hidden items-center gap-2 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-600/25 transition-colors hover:bg-teal-700 lg:flex"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/oja-logo-trans-icon.png"
                alt=""
                className="h-6 w-6"
              />
              Sell on Oja
            </a>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="space-y-4 border-t border-gray-100 bg-white p-4 shadow-xl lg:hidden">
          <Suspense fallback={<SearchBoxFallback />}>
            <SearchBox />
          </Suspense>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/products"
              className="flex flex-col items-center gap-2 rounded-xl bg-teal-50 p-4"
              onClick={() => setIsMenuOpen(false)}
            >
              <Package className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-medium">Products</span>
            </Link>
            <Link
              href="/stores"
              className="flex flex-col items-center gap-2 rounded-xl bg-teal-50 p-4"
              onClick={() => setIsMenuOpen(false)}
            >
              <StoreIcon className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-medium">Stores</span>
            </Link>
            <Link
              href="/categories"
              className="flex flex-col items-center gap-2 rounded-xl bg-teal-50 p-4"
              onClick={() => setIsMenuOpen(false)}
            >
              <Tag className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-medium">Categories</span>
            </Link>
            <a
              href={getSignInUrl()}
              className="flex flex-col items-center gap-2 rounded-xl bg-teal-50 p-4"
              onClick={() => setIsMenuOpen(false)}
            >
              <LogIn className="h-6 w-6 text-teal-600" />
              <span className="text-sm font-medium">Log in</span>
            </a>
          </div>
          <a
            href={getSignupAsStoreOwnerUrl()}
            className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 p-3 font-bold text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            Sell on Oja
          </a>
        </div>
      )}
    </nav>
  );
}

function SearchBoxFallback({ className }: { className?: string }) {
  return (
    <div
      className={`h-10 flex-1 rounded-full border border-gray-200 bg-gray-50 ${className ?? ""}`}
    />
  );
}
