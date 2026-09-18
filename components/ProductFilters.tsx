"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { MarketplaceCategory } from "@/lib/types";
import { cn } from "@/lib/cn";

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "price:asc", label: "Price: low to high" },
  { value: "price:desc", label: "Price: high to low" },
  { value: "viewCount:desc", label: "Popularity" },
  { value: "rating:desc", label: "Top rated" },
];

/**
 * The one client component on `/products`: filter/sort controls that
 * update the URL, which is what actually drives the (server-rendered,
 * ISR-cached) results below. See §2.1c.
 */
export default function ProductFilters({
  categories,
}: {
  categories: MarketplaceCategory[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategoryIds = searchParams.get("categoryIds")?.split(",") ?? [];
  const hasDiscount = searchParams.get("hasDiscount") === "true";
  const sortBy = searchParams.get("sortBy") ?? "createdAt:desc";
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const hasActiveFilters =
    activeCategoryIds.length > 0 ||
    hasDiscount ||
    Boolean(searchParams.get("minPrice")) ||
    Boolean(searchParams.get("maxPrice")) ||
    Boolean(searchParams.get("q"));

  function updateParams(updates: Record<string, string | undefined>) {
    const qs = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) qs.delete(key);
      else qs.set(key, value);
    }
    qs.delete("page");
    router.push(`/products?${qs.toString()}`);
  }

  function toggleCategory(id: string) {
    const next = activeCategoryIds.includes(id)
      ? activeCategoryIds.filter((c) => c !== id)
      : [...activeCategoryIds, id];
    updateParams({ categoryIds: next.length ? next.join(",") : undefined });
  }

  function applyPriceRange() {
    updateParams({
      minPrice: minPrice.trim() || undefined,
      maxPrice: maxPrice.trim() || undefined,
    });
  }

  function clearAll() {
    setMinPrice("");
    setMaxPrice("");
    router.push("/products");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              activeCategoryIds.includes(category.id)
                ? "border-teal-700 bg-teal-700 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-teal-400 hover:text-teal-700",
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={hasDiscount}
            onChange={(e) =>
              updateParams({ hasDiscount: e.target.checked ? "true" : undefined })
            }
          />
          On discount
        </label>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min ₦"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPriceRange}
            onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
            className="w-24 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-teal-500"
          />
          <span className="text-gray-400">–</span>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max ₦"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPriceRange}
            onKeyDown={(e) => e.key === "Enter" && applyPriceRange()}
            className="w-24 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm outline-none focus:border-teal-500"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => updateParams({ sortBy: e.target.value })}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-teal-500"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-sm font-semibold text-gray-500 underline hover:text-gray-800"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
