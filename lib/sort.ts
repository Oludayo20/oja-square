/**
 * Display-order helpers — visual quality, not a replacement for whatever
 * sort the caller already applied (price, rating, newest, etc). A product
 * or category without an image isn't hidden (it may still be perfectly
 * real — §3.1's eligibility rule and `lib/quality.ts`'s dummy filter
 * already handle correctness; this only handles how the survivors are
 * arranged).
 */

import { getPrimaryImageUrl } from "./ecom-api";
import type { MarketplaceCategory, MarketplaceProduct, MarketplaceStore } from "./types";

function hasImage(input: { imageUrls?: string[] | null; thumbnail?: string | null }): boolean {
  return getPrimaryImageUrl(input) !== "";
}

/**
 * Round-robins items across groups instead of leaving them clustered —
 * e.g. a merchant who bulk-uploaded 10 products in one sitting all sort
 * together under "Newest," so the raw API order shows 5+ in a row from one
 * store before another store's products appear at all. This takes one item
 * per group in turn (groups ordered by first appearance), cycling until
 * every item is placed, so no two consecutive results share a group unless
 * one group so outnumbers the rest that it's unavoidable at the tail.
 * Stable within each group — doesn't reorder a single store's own items
 * relative to each other, only interleaves *across* stores.
 */
export function interleaveByGroup<T>(items: T[], keyFn: (item: T) => string): T[] {
  const buckets = new Map<string, T[]>();
  const groupOrder: string[] = [];
  for (const item of items) {
    const key = keyFn(item);
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = [];
      buckets.set(key, bucket);
      groupOrder.push(key);
    }
    bucket.push(item);
  }

  const result: T[] = [];
  let remaining = items.length;
  while (remaining > 0) {
    for (const key of groupOrder) {
      const bucket = buckets.get(key)!;
      if (bucket.length > 0) {
        result.push(bucket.shift()!);
        remaining--;
      }
    }
  }
  return result;
}

/**
 * Images-first, then interleaved across stores so the same merchant's
 * catalog can't dominate five-in-a-row. Sorting first (stable) means each
 * store's own items keep their best-first order going into the round-robin.
 */
export function sortProductsImageFirst(products: MarketplaceProduct[]): MarketplaceProduct[] {
  const byImage = [...products].sort((a, b) => Number(hasImage(b)) - Number(hasImage(a)));
  return interleaveByGroup(byImage, (p) => p.store.id);
}

/** Stores with a logo first, then by product count — no interleaving needed, every row is already a distinct store. */
export function sortStoresForDisplay(stores: MarketplaceStore[]): MarketplaceStore[] {
  return [...stores].sort((a, b) => {
    const imageDelta = Number(Boolean(b.logoUrl)) - Number(Boolean(a.logoUrl));
    if (imageDelta !== 0) return imageDelta;
    return (b._count?.products ?? 0) - (a._count?.products ?? 0);
  });
}

/**
 * Categories with an image and more products lead, then interleaved across
 * stores — a store with several well-stocked categories otherwise stacks
 * them all at the top, ahead of every other store's best category.
 */
export function sortCategoriesForDisplay(categories: MarketplaceCategory[]): MarketplaceCategory[] {
  const byQuality = [...categories].sort((a, b) => {
    const imageDelta = Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl));
    if (imageDelta !== 0) return imageDelta;
    return b._count.products - a._count.products;
  });
  return interleaveByGroup(byQuality, (c) => c.storeId);
}
