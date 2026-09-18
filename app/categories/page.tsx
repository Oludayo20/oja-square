import type { Metadata } from "next";
import Link from "next/link";
import { Tag } from "lucide-react";
import { listMarketplaceCategories } from "@/lib/api/categories";
import { isLikelyRealCategory } from "@/lib/quality";
import { sortCategoriesForDisplay } from "@/lib/sort";
import { getSiteUrl } from "@/lib/seo";
import CategoryCard from "@/components/CategoryCard";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 300;

const TITLE = "Categories — Shop by Category Across Every Store on Oja";
const DESCRIPTION =
  "Explore product categories aggregated from every independent merchant on Oja — sort orders (popularity, A-Z) don't change what's here, just how it's arranged.";

// `sortBy` only reorders the same set of categories — same content either
// way, so canonical always collapses to the base URL rather than treating
// each sort order as a distinct indexable page.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/categories" },
  openGraph: { title: `${TITLE} | Oja Square`, description: DESCRIPTION, url: "/categories" },
};

const SORT_OPTIONS = [
  { value: "popular", label: "Most products" },
  { value: "name", label: "Name: A-Z" },
];

interface Props {
  searchParams: Promise<{ sortBy?: string }>;
}

export default async function CategoriesPage({ searchParams }: Props) {
  const { sortBy = "popular" } = await searchParams;
  const raw = await listMarketplaceCategories(120);
  const real = raw.filter(isLikelyRealCategory);

  // Not paginated (`listMarketplaceCategories` returns a flat capped list,
  // no `pagination.total` to desync) — safe to sort freely here, unlike
  // `/products`/`/stores`.
  const categories =
    sortBy === "name"
      ? [...real].sort((a, b) => a.name.localeCompare(b.name))
      : sortCategoriesForDisplay(real);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-teal-600" />
          <h1 className="oja-display text-xl font-800 text-gray-900">
            All categories <span className="font-normal text-gray-400">({categories.length})</span>
          </h1>
        </div>

        <div className="flex gap-2 text-sm">
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={`/categories?sortBy=${option.value}`}
              className={
                sortBy === option.value
                  ? "font-bold text-teal-700 underline"
                  : "text-gray-500 hover:text-gray-800"
              }
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category, i) => (
            <CategoryCard key={category.id} category={category} priority={i < 5} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-gray-500">No categories yet.</p>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Oja Square", item: getSiteUrl() },
            { "@type": "ListItem", position: 2, name: "Categories", item: `${getSiteUrl()}/categories` },
          ],
        }}
      />
      {categories.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: categories.slice(0, 50).map((category, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${getSiteUrl()}/products?categoryIds=${category.id}`,
              name: category.name,
            })),
          }}
        />
      )}
    </div>
  );
}
