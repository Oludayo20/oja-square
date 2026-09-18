import { ecomFetch } from "../ecom-api";
import type { ApiResponse, MarketplaceCategory } from "../types";

/**
 * `GET /category/marketplace` (`listCategoriesForMarketplace`): already
 * correctly scoped to categories with ≥1 ACTIVE product server-side, unlike
 * the product/store endpoints (§3.1). No pagination, just a capped `limit`.
 *
 * Returns raw per-store category rows (no cross-store "Shoes" merging),
 * a known, accepted cosmetic gap at current scale (§3.3).
 */
export async function listMarketplaceCategories(
  limit = 120,
): Promise<MarketplaceCategory[]> {
  const res = await ecomFetch<ApiResponse<{ items: MarketplaceCategory[] }>>(
    `/category/marketplace?limit=${limit}`,
    { method: "GET", revalidateSeconds: 300 },
  );

  return res.data.items;
}
