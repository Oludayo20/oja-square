import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

/**
 * Static routes only, deliberately no per-product/per-store URLs. Oja
 * Square doesn't host product detail pages itself (those live on each
 * store's own subdomain), and listing thousands of `?categoryIds=`/`?q=`
 * filter-combo URLs here would just be sitemap noise search engines
 * already advise against submitting. `/search` is excluded too: it's
 * noindexed (see its `metadata.robots`), so it has no business in a
 * sitemap either.
 */
const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "hourly", priority: 1 },
  { path: "/products", changeFrequency: "hourly", priority: 0.9 },
  { path: "/stores", changeFrequency: "daily", priority: 0.8 },
  { path: "/categories", changeFrequency: "daily", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();
  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
