import { Package } from "lucide-react";
import { searchProducts } from "@/lib/api/products";
import { listMarketplaceCategories } from "@/lib/api/categories";
import { isLikelyRealProduct } from "@/lib/quality";
import { sortProductsImageFirst } from "@/lib/sort";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import Pagination from "@/components/Pagination";
import SellBanner from "@/components/SellBanner";

// Filtered/paginated by query string — many distinct combinations, so this
// is ISR-cached per unique URL rather than build-time static. See §2.1c.
export const revalidate = 60;

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
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
          {displayItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-gray-500">No products match those filters.</p>
      )}

      <Pagination pagination={pagination} basePath="/products" searchParams={params} />

      <SellBanner />
    </div>
  );
}
