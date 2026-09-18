import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

/**
 * Own robots setup, pointed at `oja.com.ng` — not `oja-frontend`'s
 * `sitemap.ts` (which defaults to `useoja.com` and is irrelevant here once
 * `oja-frontend`'s cross-store pages are deprecated). See §5.2a.
 *
 * Explicit allow-rules for AI crawlers/answer engines mirror
 * `oja-landing-page/app/robots.ts` — search + assistant citation is a real
 * acquisition channel now, not just traditional search.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      // Explicit allow for AI crawlers/answer engines (search + assistant citation).
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "cohere-ai", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
      { userAgent: "Meta-ExternalAgent", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
