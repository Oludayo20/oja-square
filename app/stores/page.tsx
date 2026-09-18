import type { Metadata } from "next";
import Link from "next/link";
import { Search, Store as StoreIcon } from "lucide-react";
import { searchStores } from "@/lib/api/stores";
import { isLikelyRealStore } from "@/lib/quality";
import { sortStoresForDisplay } from "@/lib/sort";
import { getSiteUrl } from "@/lib/seo";
import { getStorefrontUrl } from "@/lib/oja-links";
import StoreCard from "@/components/StoreCard";
import Pagination from "@/components/Pagination";
import SellBanner from "@/components/SellBanner";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 120;

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest" },
  { value: "name:asc", label: "Name: A-Z" },
  { value: "name:desc", label: "Name: Z-A" },
];

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const title = params.search
    ? `"${params.search}": Store Results`
    : "Stores: Discover Nigerian Merchants on Oja";
  const description =
    "Browse independent Nigerian merchant stores selling on Oja. Every store here has active, in-stock products ready to buy.";
  // `sortBy` reorders the same set (not distinct content); `search` narrows
  // it to a genuinely different result set and is worth its own indexed URL.
  const canonical = params.search
    ? `/stores?search=${encodeURIComponent(params.search)}`
    : "/stores";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title: `${title} | Oja Square`, description, url: canonical },
  };
}

export default async function StoresPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const sortBy = params.sortBy || "createdAt:desc";

  const { items, pagination } = await searchStores({
    search: params.search,
    sortBy,
    page,
  });

  // Same known pagination-count caveat as `/products`, see `lib/quality.ts`.
  const displayItems = sortStoresForDisplay(items.filter(isLikelyRealStore));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <StoreIcon className="h-5 w-5 text-teal-600" />
          <h1 className="oja-display text-xl font-800 text-gray-900">
            Stores <span className="font-normal text-gray-400">({pagination.total})</span>
          </h1>
        </div>

        {/*
         * Plain links, not a client-side <select>. Sorting is just a URL
         * change, and this way the page needs zero extra client JS for it.
         * `oja-frontend`'s equivalent (`StoresPage.tsx`) captures `sortBy`
         * in state but never sends it to the API at all (a real bug, not
         * fixed here since it's `oja-frontend`'s code, not this app's).
         */}
        <div className="flex gap-2 text-sm">
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={`/stores?sortBy=${option.value}${params.search ? `&search=${params.search}` : ""}`}
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

      {/* Plain GET form: a real search box `/stores` had no UI for at all,
       * even though `searchStores`/the backend already supported `search`.
       * No client JS: submitting a GET form is a normal browser navigation. */}
      <form action="/stores" method="GET" className="relative max-w-md">
        <input type="hidden" name="sortBy" value={sortBy} />
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          name="search"
          defaultValue={params.search ?? ""}
          placeholder="Search stores by name..."
          className="w-full rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
        />
      </form>

      {displayItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((store, i) => (
            <StoreCard key={store.id} store={store} priority={i < 3} />
          ))}
        </div>
      ) : (
        <p className="py-20 text-center text-gray-500">No stores found.</p>
      )}

      <Pagination pagination={pagination} basePath="/stores" searchParams={params} />

      <SellBanner />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Oja Square", item: getSiteUrl() },
            { "@type": "ListItem", position: 2, name: "Stores", item: `${getSiteUrl()}/stores` },
          ],
        }}
      />
      {displayItems.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: displayItems.slice(0, 24).map((store, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: getStorefrontUrl(store.slug),
              name: store.name,
            })),
          }}
        />
      )}
    </div>
  );
}
