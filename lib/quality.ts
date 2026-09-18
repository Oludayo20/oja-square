/**
 * Best-effort filters for seed/test data leaking into a public marketplace
 * page. This is a heuristic, not a data-integrity fix — `oja-backend` has
 * no `isTestData`/`seedSource` flag on `Product`/`Store`/`Category` to check
 * directly, so this infers it from naming patterns and contact-email
 * domains instead. It will have false positives (a real merchant named
 * "Best Test Kitchen Supplies") and false negatives (junk data that happens
 * not to match any pattern here) — treat it as noise reduction on top of
 * §3.1's real ACTIVE+in-stock eligibility rule, not a replacement for it.
 *
 * If this keeps mattering, the actual fix is a backend flag set at creation
 * time (e.g. by an admin/seed script), checked server-side like §3.1's
 * status filter — not an ever-growing regex list maintained here.
 *
 * KNOWN LIMITATION shared with §3.1's eligibility filter: applying this to
 * an already-paginated API response (`/products`, `/stores`) can make a
 * page render fewer than the requested `limit` items, since `pagination.total`
 * doesn't know about this client-side filter. Accepted for the same reason
 * documented in `lib/api/products.ts` / `lib/api/stores.ts` — the real fix
 * is server-side, and it isn't worth the complexity of over-fetching and
 * re-paginating client-side for a heuristic filter. The home page's curated
 * sections don't have this problem — they aren't paginated, so callers there
 * over-fetch and slice instead (see `app/page.tsx`).
 */

import type { MarketplaceCategory, MarketplaceProduct, MarketplaceStore } from "./types";

/** Whole-word "test" — so "Latest", "Testosterone Booster" etc. don't false-positive. */
const TEST_WORD = /\btest\b/i;

const LOREM_IPSUM = /lorem\s+ipsum/i;

/** Generic placeholder names seed scripts and manual test accounts tend to use. */
const PLACEHOLDER_NAME = /^(sample|demo|dummy|placeholder|example|untitled|xxx+|asdf+|qwerty|new\s*(product|store|category)|my\s*store)\b/i;

/** "Product 1", "Item #23", "Category 4" — sequential seed-script naming. */
const GENERIC_NUMBERED = /^(product|item|category|store)\s*#?\d+$/i;

/**
 * Known throwaway/test email domains — the actual pattern seed and manual
 * test accounts on this platform use, as distinct from `REAL_EMAIL_DOMAINS`
 * below (per product direction: real merchants on this platform are
 * predominantly individuals signing up with a personal Gmail/Yahoo address,
 * not a branded domain).
 */
const TEST_EMAIL_DOMAINS = new Set([
  "test.com",
  "example.com",
  "example.org",
  "example.net",
  "fake.com",
  "mailinator.com",
  "yopmail.com",
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "dummy.com",
]);

/**
 * Domains real merchants on this platform overwhelmingly sign up with.
 * Deliberately used as a *positive* signal only, not as the sole test for
 * "real" — a merchant with a branded business domain email is still real;
 * an absent email (very common — it's an optional contact field distinct
 * from the account's signup email) is neutral, not a red flag either.
 */
const REAL_EMAIL_DOMAINS = new Set(["gmail.com", "yahoo.com"]);

function emailDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at === -1) return null;
  return email.slice(at + 1).trim().toLowerCase();
}

/** `null` = no signal either way (no email, or a domain we don't recognize). */
function emailSignal(email: string | null | undefined): "real" | "test" | null {
  const trimmed = email?.trim();
  if (!trimmed) return null;
  const domain = emailDomain(trimmed);
  if (!domain) return null;
  if (TEST_EMAIL_DOMAINS.has(domain)) return "test";
  if (REAL_EMAIL_DOMAINS.has(domain)) return "real";
  const localPart = trimmed.slice(0, trimmed.lastIndexOf("@"));
  if (/\b(test|demo)\b/i.test(localPart)) return "test";
  return null;
}

export function isLikelyRealStore(store: Pick<MarketplaceStore, "name" | "slug" | "email">): boolean {
  if (TEST_WORD.test(store.name) || TEST_WORD.test(store.slug)) return false;
  if (PLACEHOLDER_NAME.test(store.name.trim())) return false;
  if (GENERIC_NUMBERED.test(store.name.trim())) return false;
  if (emailSignal(store.email) === "test") return false;
  return true;
}

export function isLikelyRealProduct(
  product: Pick<MarketplaceProduct, "name" | "shortDescription" | "store">,
): boolean {
  if (TEST_WORD.test(product.name)) return false;
  if (PLACEHOLDER_NAME.test(product.name.trim())) return false;
  if (GENERIC_NUMBERED.test(product.name.trim())) return false;
  if (LOREM_IPSUM.test(product.name) || LOREM_IPSUM.test(product.shortDescription ?? "")) {
    return false;
  }
  // Cascades from the store check using the fields product search actually
  // exposes on its nested `store` (id/name/logoUrl/slug — no email there,
  // so only the name/slug half of isLikelyRealStore applies here).
  if (TEST_WORD.test(product.store.name) || TEST_WORD.test(product.store.slug)) return false;
  if (PLACEHOLDER_NAME.test(product.store.name.trim())) return false;
  return true;
}

export function isLikelyRealCategory(
  category: Pick<MarketplaceCategory, "name">,
): boolean {
  if (TEST_WORD.test(category.name)) return false;
  if (PLACEHOLDER_NAME.test(category.name.trim())) return false;
  if (GENERIC_NUMBERED.test(category.name.trim())) return false;
  return true;
}
