/**
 * Shared SEO constants/helpers, one source of truth for the site URL,
 * brand copy, and keyword set so every page's metadata/JSON-LD stays
 * consistent instead of hand-typing the same strings per file.
 */

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return "https://oja.com.ng";
}

/** Absolute URL for a path. JSON-LD and social meta need absolute, not relative, URLs. */
export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const SITE_NAME = "Oja Square";

/**
 * Base description, reused (with page-specific variants layered on top) so
 * every page shares the same core positioning rather than drifting.
 */
export const SITE_DESCRIPTION =
  "Oja Square is Oja's cross-store online marketplace in Nigeria. Browse products from every independent Nigerian merchant on Oja in one place, then buy directly from the store that sells it.";

/**
 * Natural, non-stuffed keyword set covering how a Nigerian buyer actually
 * searches (marketplace/shopping intent) plus the brand terms themselves.
 * Used as a seed list for per-page `keywords` arrays, not pasted verbatim
 * everywhere. Each page should still lead with what's specific to it.
 */
export const CORE_KEYWORDS = [
  "Oja Square",
  "Oja marketplace",
  "online marketplace Nigeria",
  "shop Nigerian stores online",
  "Nigerian online shopping",
  "buy from Nigerian merchants",
  "compare prices Nigeria",
  "Nigeria ecommerce marketplace",
];

/** Official Oja social profiles, reused for JSON-LD `sameAs` (same brand as oja-landing-page/oja-frontend). */
export const OJA_SAME_AS = [
  "https://www.facebook.com/ojacomng",
  "https://www.instagram.com/oja.com.ng",
  "https://x.com/Ojacomng",
  "https://www.tiktok.com/@ojacomng",
  "https://www.linkedin.com/in/oja-nigeria-40a13a400",
  "https://youtube.com/@ojacomng",
];
