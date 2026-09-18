import { ecomFetch } from "../ecom-api";
import { isLikelyRealCategory, isLikelyRealProduct, isLikelyRealStore } from "../quality";
import type { ApiResponse, GlobalSearchResult } from "../types";

/**
 * `GET /search` (`searchAll`) uses `optionalAuth` — when a session cookie is
 * present it also returns the caller's own matching orders. `ecomFetch`
 * never forwards credentials (see `lib/ecom-api.ts`), so this call is always
 * anonymous and the response is always the public subset — safe to cache
 * and identical for every visitor searching the same query. The `orders`
 * field (present only for authenticated callers) isn't in `GlobalSearchResult`
 * at all — nothing here could accidentally render it. See §2.1c.
 *
 * Dummy-data filtering (`lib/quality.ts`) happens here once, not in each
 * caller (`app/search/page.tsx`, `app/api/search/route.ts`'s typeahead) —
 * search has no pagination total to desync, so there's no reason not to
 * filter directly rather than push it onto every consumer.
 */
export async function globalSearch(query: string): Promise<GlobalSearchResult> {
  if (!query.trim()) {
    return { products: [], categories: [], stores: [] };
  }

  const res = await ecomFetch<ApiResponse<GlobalSearchResult>>(
    `/search?q=${encodeURIComponent(query)}`,
    { method: "GET", revalidateSeconds: 60 },
  );

  return {
    products: res.data.products.filter(isLikelyRealProduct),
    categories: res.data.categories.filter(isLikelyRealCategory),
    stores: res.data.stores.filter(isLikelyRealStore),
  };
}
