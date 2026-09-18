import { ecomFetch } from "../ecom-api";
import type { ApiResponse, MarketplaceStore, Paginated, StoreSearchParams } from "../types";

/**
 * `GET /store` (`getAll`). Has no eligibility filter of its own — returns
 * every store regardless of product count (§3.3). Filtering to stores with
 * ≥1 eligible product belongs server-side (§8.4); this fetch doesn't
 * attempt a client-side substitute for the same pagination-integrity reason
 * documented in `lib/api/products.ts`.
 */
export async function searchStores(
  params: StoreSearchParams = {},
): Promise<Paginated<MarketplaceStore>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  qs.set("sortBy", params.sortBy || "createdAt:desc");
  qs.set("page", String(params.page || 1));
  qs.set("limit", String(params.limit || 12));

  const res = await ecomFetch<ApiResponse<Paginated<MarketplaceStore>>>(
    `/store?${qs.toString()}`,
    { method: "GET", revalidateSeconds: 120 },
  );

  return res.data;
}
