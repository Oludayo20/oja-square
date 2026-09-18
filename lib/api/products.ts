import { ecomFetch } from "../ecom-api";
import type {
  ApiResponse,
  MarketplaceProduct,
  Paginated,
  ProductSearchParams,
} from "../types";

/**
 * `POST /product/search` (`getAllProducts`). Deliberately sends
 * `status: "ACTIVE"` explicitly — don't rely on the endpoint's own default,
 * which (as of writing) has none, and returns every status including
 * DRAFT/PAUSED/ARCHIVED and the invisible Oja Flash snapshot products if the
 * caller omits it. See `oja-docs/OJA_MARKETPLACE_FEATURE.md` §3.1.
 *
 * The in-stock half of §3.1's eligibility rule (`inventory.quantity > 0` or
 * untracked) has **no query param on this endpoint at all** — it can only be
 * enforced correctly in the database query, because filtering client-side
 * after the fact would desync `pagination.total`/`totalPages` from what's
 * actually shown (a page could render fewer than `limit` items, or a "next
 * page" button that leads to an empty page). That backend fix (§3.1, §8.4)
 * is a prerequisite for this page being fully correct, not an enhancement —
 * this function does not attempt to paper over it client-side.
 *
 * `revalidateSeconds` defaults to 60 (§2.1c's "listings can be shorter"
 * guidance) — pass it explicitly, don't drop it. `ecomFetch` treats a
 * missing value as `cache: "no-store"`, which forces whole-route dynamic
 * rendering in any page that calls this — including ones like the home
 * page that have no other reason to be dynamic.
 */
export async function searchProducts(
  params: ProductSearchParams,
  revalidateSeconds = 60,
): Promise<Paginated<MarketplaceProduct>> {
  const res = await ecomFetch<ApiResponse<Paginated<MarketplaceProduct>>>(
    "/product/search",
    {
      method: "POST",
      revalidateSeconds,
      body: JSON.stringify({
        status: "ACTIVE",
        search: params.search || undefined,
        categoryIds: params.categoryIds?.length ? params.categoryIds : undefined,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        hasDiscount: params.hasDiscount || undefined,
        sortBy: params.sortBy || "createdAt:desc",
        page: params.page || 1,
        limit: params.limit || 24,
      }),
    },
  );

  return res.data;
}

/**
 * ACTIVE + in stock (or not stock-tracked) — §3.1's eligibility rule,
 * evaluated per item for display-time decisions (e.g. hiding a stale card),
 * not as a page-level list filter (see the caveat above).
 */
export function isEligible(product: MarketplaceProduct): boolean {
  if (product.status !== "ACTIVE") return false;
  const inv = product.inventory;
  if (!inv) return true;
  if (!inv.trackQuantity) return true;
  return inv.quantity > 0;
}
