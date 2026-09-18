import type { Metadata } from "next";
import { Search as SearchIcon } from "lucide-react";
import { globalSearch } from "@/lib/api/search";
import {
  sortCategoriesForDisplay,
  sortProductsImageFirst,
  sortStoresForDisplay,
} from "@/lib/sort";
import { getSiteUrl } from "@/lib/seo";
import ProductCard from "@/components/ProductCard";
import StoreCard from "@/components/StoreCard";
import CategoryCard from "@/components/CategoryCard";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ q?: string }>;
}

/**
 * Internal search results are the textbook case for noindex,follow: a
 * thin, effectively infinite-variation page state that would otherwise
 * flood the index with query permutations instead of the actual content
 * (that's `/products`/`/stores`/`/categories`'s job). `follow: true` still
 * lets crawlers reach the products/stores it links to.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Search results for "${q}"` : "Search Oja Square";
  return {
    title,
    description:
      "Search products, stores, and categories across every store on Oja.",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const result = await globalSearch(q);
  const products = sortProductsImageFirst(result.products);
  const categories = sortCategoriesForDisplay(result.categories);
  const stores = sortStoresForDisplay(result.stores);
  const hasResults = products.length + categories.length + stores.length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <SearchIcon className="h-5 w-5 text-teal-600" />
        <h1 className="oja-display text-xl font-800 text-gray-900">
          {q ? `Results for "${q}"` : "Search Oja Square"}
        </h1>
      </div>

      {!q ? (
        <p className="text-gray-500">Type something in the search box above to get started.</p>
      ) : !hasResults ? (
        <p className="py-20 text-center text-gray-500">Nothing matched &quot;{q}&quot;.</p>
      ) : (
        <>
          {stores.length > 0 && (
            <section>
              <h2 className="oja-display mb-4 text-lg font-700 text-gray-900">Stores</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            </section>
          )}

          {categories.length > 0 && (
            <section>
              <h2 className="oja-display mb-4 text-lg font-700 text-gray-900">Categories</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>
          )}

          {products.length > 0 && (
            <section>
              <h2 className="oja-display mb-4 text-lg font-700 text-gray-900">Products</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Oja Square", item: getSiteUrl() },
            { "@type": "ListItem", position: 2, name: "Search", item: `${getSiteUrl()}/search` },
          ],
        }}
      />
    </div>
  );
}
