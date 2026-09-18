import type { MetadataRoute } from "next";

/** Own sitemap/robots setup, pointed at `oja.com.ng` — not `oja-frontend`'s
 * `sitemap.ts` (which defaults to `useoja.com` and is irrelevant here once
 * `oja-frontend`'s cross-store pages are deprecated). See §5.2a. */
export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://oja.com.ng").replace(
    /\/$/,
    "",
  );
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
