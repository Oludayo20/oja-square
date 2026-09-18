import type { Metadata } from "next";
import { Package } from "lucide-react";
import { searchProducts } from "@/lib/api/products";
import { listMarketplaceCategories } from "@/lib/api/categories";
import { isLikelyRealProduct } from "@/lib/quality";
import { sortProductsImageFirst } from "@/lib/sort";
import { getSiteUrl } from "@/lib/seo";
import { getStorefrontUrl } from "@/lib/oja-links";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import Pagination from "@/components/Pagination";
import SellBanner from "@/components/SellBanner";
import { JsonLd } from "@/components/JsonLd";

// Filtered/paginated by query string — many distinct combinations, so this
// is ISR-cached per unique URL rather than build-time static. See §2.1c.
export const revalidate = 60;

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const categoryIds = params.categoryIds?.split(",").filter(Boolean) ?? [];

  // No "on Oja Square" / trailing brand suffix here — the root layout's
  // title template (`%s | Oja Square`) already appends it; duplicating it
  // per-page produced titles like "X — Shop X on Oja Square | Oja Square".
  let title = "All Products — Shop Every Store on Oja";
  if (params.q) {
    title = `"${params.q}" — Product Results`;
  } else if (categoryIds.length === 1) {
    const categories = await listMarketplaceCategories(120);
    const match = categories.find((c) => c.id === categoryIds[0]);
    if (match) title = `Shop ${match.name} — All Stores`;
  }

  const description =
    "Browse products from every independent Nigerian merchant on Oja — filter by category, price, and discount, then buy directly from the store that sells it.";

  // Free-text search results are a thin, endlessly-variable page state —
  // standard SEO practice is to keep it crawlable (follow) but not indexed,
  // same treatment as /search itself. Category/price/discount filters are
  // real, distinct catalog views and stay indexable.
  const isSearchResult = Boolean(params.q);

  // Canonical keeps content-narrowing filters (category/price/discount —
  // each is a genuinely different set of products, worth its own indexed
  // URL) but strips ordering/pagination noise (`sortBy` reorders the exact
  // same set; `page` beyond 1 isn't a distinct "topic"). Collapsing
  // *every* filter combo down to bare /products would prevent a real
  // category page from ever ranking for its own category's searches.
  const canonicalParams = new URLSearchParams();
  if (categoryIds.length) canonicalParams.set("categoryIds", categoryIds.join(","));
  if (params.minPrice) canonicalParams.set("minPrice", params.minPrice);
  if (params.maxPrice) canonicalParams.set("maxPrice", params.maxPrice);
  if (params.hasDiscount === "true") canonicalParams.set("hasDiscount", "true");
  const canonicalQuery = canonicalParams.toString();
  const canonical = canonicalQuery ? `/products?${canonicalQuery}` : "/products";

  return {
    title,
    description,
    alternates: { canonical },
    robots: isSearchResult
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: { title: `${title} | Oja Square`, description, url: canonical },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const categoryIds = params.categoryIds?.split(",").filter(Boolean);
  const page = Number(params.page) || 1;

  const [{ items, pagination }, categories] = await Promise.all([
    searchProducts({
      search: params.q,
      categoryIds,
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      hasDiscount: params.hasDiscount === "true",
      sortBy: params.sortBy,
      page,
    }),
    listMarketplaceCategories(30),
  ]);

  // Dummy-data filter applied to the displayed page only — same known
  // pagination-count caveat as §3.1's eligibility filter (lib/quality.ts).
  const displayItems = sortProductsImageFirst(items.filter(isLikelyRealProduct));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <Package className="h-5 w-5 text-teal-600" />
        <h1 className="oja-display text-xl font-800 text-gray-900">
          All products <span className="font-normal text-gray-400">({pagination.total})</span>
        </h1>
      </div>

      <ProductFilters categories={categories} />

      {displayItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {displayItems.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-gray-500">No products match those filters.</p>
      )}

      <Pagination pagination={pagination} basePath="/products" searchParams={params} />

      <SellBanner />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Oja Square", item: getSiteUrl() },
            { "@type": "ListItem", position: 2, name: "All Products", item: `${getSiteUrl()}/products` },
          ],
        }}
      />
      {displayItems.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: displayItems.slice(0, 24).map((product, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${getStorefrontUrl(product.store.slug)}/product/${product.slug}`,
              name: product.name,
            })),
          }}
        />
      )}
    </div>
  );
}
