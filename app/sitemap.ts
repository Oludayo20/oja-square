import type { MetadataRoute } from "next";

const STATIC_PATHS = ["/", "/products", "/stores", "/categories"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://oja.com.ng").replace(
    /\/$/,
    "",
  );
  return STATIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
