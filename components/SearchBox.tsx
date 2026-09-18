"use client";

import { Search, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { getMediaUrl, getPrimaryImageUrl } from "@/lib/ecom-api";
import { getStorefrontUrl } from "@/lib/oja-links";
import type { GlobalSearchResult } from "@/lib/types";

function formatNaira(value: string | number) {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
}

/** Marketplace search with live product / store / category suggestions. */
export default function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      return;
    }

    let cancelled = false;
    const t = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (cancelled) return;
        if (!res.ok) {
          setResults({ products: [], categories: [], stores: [] });
          return;
        }
        setResults((await res.json()) as GlobalSearchResult);
      } catch {
        if (!cancelled) {
          setResults({ products: [], categories: [], stores: [] });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [value]);

  function goToResults() {
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setShowSuggestions(false);
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    goToResults();
  }

  const hasAny =
    (results?.products.length ?? 0) +
      (results?.categories.length ?? 0) +
      (results?.stores.length ?? 0) >
    0;

  return (
    <div className={cn("relative flex-1", className)} ref={searchRef}>
      <form onSubmit={handleSearch} className="relative w-full">
        <input
          type="search"
          placeholder="Search products, brands, categories..."
          className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </form>

      {showSuggestions && value.trim().length >= 2 && (
        <div className="absolute top-full z-[60] mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {results?.products.length ? (
                <div className="p-2">
                  <h4 className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Products
                  </h4>
                  {results.products.map((product) => {
                    const image = getPrimaryImageUrl(product);
                    return (
                      <a
                        key={product.id}
                        href={`${getStorefrontUrl(product.store.slug)}/product/${product.slug}`}
                        className="group flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-gray-50"
                      >
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image}
                            alt=""
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-100" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-gray-900 group-hover:text-teal-600">
                            {product.name}
                          </div>
                          <div className="text-xs font-bold text-teal-600">
                            {formatNaira(product.discountedPrice || product.price)}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              ) : null}

              {results?.categories.length ? (
                <div className="border-t border-gray-50 p-2">
                  <h4 className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Categories
                  </h4>
                  {results.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?categoryIds=${cat.id}`}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-gray-50"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-teal-50">
                        <Tag className="h-4 w-4 text-teal-600" />
                      </div>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              ) : null}

              {results?.stores.length ? (
                <div className="border-t border-gray-50 p-2">
                  <h4 className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Stores
                  </h4>
                  {results.stores.map((store) => {
                    const logo = getMediaUrl(store.logoUrl);
                    return (
                      <a
                        key={store.id}
                        href={getStorefrontUrl(store.slug)}
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-gray-50"
                      >
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logo}
                            alt=""
                            className="h-8 w-8 rounded border border-gray-200"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded border border-gray-200 bg-gray-50" />
                        )}
                        <span className="text-sm font-medium">{store.name}</span>
                      </a>
                    );
                  })}
                </div>
              ) : null}

              {!hasAny && !isLoading && (
                <div className="p-4 text-center text-sm text-gray-500">
                  No results found for &quot;{value}&quot;
                </div>
              )}

              <button
                type="button"
                onClick={goToResults}
                className="w-full cursor-pointer border-t border-gray-100 p-3 text-center text-sm font-bold text-teal-600 hover:bg-teal-50"
              >
                See all results
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
