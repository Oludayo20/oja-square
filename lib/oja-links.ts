/**
 * Cross-app links. Oja Square never implements its own auth or checkout —
 * these are plain outbound links to the apps that already do
 * (`oja-frontend`), reusing the same pattern `oja-landing-page/lib/oja-links.ts`
 * already established. See `oja-docs/OJA_MARKETPLACE_FEATURE.md` §2.1, §5.2, §5.3.
 */

const APP_ORIGIN = "https://app.useoja.com";
const MARKETING_ORIGIN = "https://useoja.com";

/** Main app origin (override with `NEXT_PUBLIC_MAIN_APP_URL`). */
export function getMainAppBase(): string {
  const explicit = process.env.NEXT_PUBLIC_MAIN_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:5173";
  return APP_ORIGIN;
}

export function getSignInUrl(): string {
  return `${getMainAppBase()}/sign-in`;
}

export function getSignupAsStoreOwnerUrl(): string {
  return `${getMainAppBase()}/signup`;
}

export function getProfileUrl(): string {
  return `${getMainAppBase()}/profile`;
}

/** Marketing site origin (override with `NEXT_PUBLIC_LANDING_PAGE_URL`). */
export function getMarketingBase(): string {
  const explicit = process.env.NEXT_PUBLIC_LANDING_PAGE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return MARKETING_ORIGIN;
}

export function getMarketingUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getMarketingBase()}${p}`;
}

/**
 * A specific store's storefront URL. Always `{slug}.useoja.com` — never
 * derived from the current request's host, since Oja Square's own host is
 * `oja.com.ng`. Store subdomains stay on `.useoja.com` only (§2.1a) — there
 * is no `*.oja.com.ng` wildcard behind this feature.
 */
export function getStorefrontUrl(slug: string): string {
  const explicit = process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN?.trim();
  const rootDomain = explicit || "useoja.com";
  if (process.env.NODE_ENV !== "production") {
    return `http://${slug}.lvh.me:5173`;
  }
  return `https://${slug}.${rootDomain}`;
}

/**
 * Store-handoff checkout URL for a single product (§5.2). Lands the buyer
 * directly on that store's checkout with the product pre-selected; the
 * store's own `Checkout.tsx` reads these params once, adds the item to its
 * local cart, then strips them from the URL.
 */
export function getStoreHandoffCheckoutUrl(params: {
  storeSlug: string;
  productId: string;
  quantity?: number;
}): string {
  const qs = new URLSearchParams({
    fromMarketplace: "1",
    productId: params.productId,
    qty: String(params.quantity ?? 1),
  });
  return `${getStorefrontUrl(params.storeSlug)}/checkout?${qs.toString()}`;
}
