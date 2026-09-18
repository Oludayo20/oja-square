import Link from "next/link";
import { Tag } from "lucide-react";
import { listMarketplaceCategories } from "@/lib/api/categories";
import { isLikelyRealCategory } from "@/lib/quality";
import { sortCategoriesForDisplay } from "@/lib/sort";
import CategoryCard from "@/components/CategoryCard";

export const revalidate = 300;

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
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-gray-500">No categories yet.</p>
      )}
    </div>
  );
}
