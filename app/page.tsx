import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store as StoreIcon,
  Tag,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { searchProducts } from "@/lib/api/products";
import { searchStores } from "@/lib/api/stores";
import { listMarketplaceCategories } from "@/lib/api/categories";
import { getSignupAsStoreOwnerUrl, getStorefrontUrl } from "@/lib/oja-links";
import { isLikelyRealCategory, isLikelyRealProduct, isLikelyRealStore } from "@/lib/quality";
import { sortCategoriesForDisplay, sortProductsImageFirst, sortStoresForDisplay } from "@/lib/sort";
import { HOME_FAQ } from "@/lib/faqContent";
import { getSiteUrl } from "@/lib/seo";
import ProductCard from "@/components/ProductCard";
import StoreCard from "@/components/StoreCard";
import CategoryCard from "@/components/CategoryCard";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 180;

/**
 * The home page's sections aren't paginated — unlike `/products`/`/stores`
 * (§3.1's, `lib/quality.ts`'s known limitation), it's safe to over-fetch a
 * cushion here, filter out anything that fails the eligibility/dummy-data
 * checks, sort images-first, and slice down to the intended display count,
 * without desyncing any pagination total.
 */
function curateProducts(
  items: Awaited<ReturnType<typeof searchProducts>>["items"],
  limit: number,
) {
  return sortProductsImageFirst(items.filter(isLikelyRealProduct)).slice(0, limit);
}

const TICKER_ITEMS = [
  "🛍️ Every store on Oja, one search away",
  "💳 Secure checkout powered by Paystack",
  "📦 Only in-stock, active listings shown",
  "🏪 Buy directly from the merchant, always",
  "🇳🇬 Built for how Nigerians shop and sell",
];

export default async function HomePage() {
  const [
    categoriesRaw,
    onSaleRaw,
    mostViewedRaw,
    newArrivalsRaw,
    topRatedRaw,
    exploreRaw,
    storesRaw,
    newStoresRaw,
  ] = await Promise.all([
    listMarketplaceCategories(20),
    searchProducts({ hasDiscount: true, limit: 14 }, 120),
    searchProducts({ sortBy: "viewCount:desc", limit: 14 }, 120),
    searchProducts({ sortBy: "createdAt:desc", limit: 10 }, 60),
    searchProducts({ sortBy: "rating:desc", limit: 14 }, 120),
    searchProducts({ limit: 24 }, 120),
    // Sorted by product count client-side (sortStoresForDisplay) rather than
    // by name/date — "Featured" means "the biggest stores," distinct from
    // "New Stores" below.
    searchStores({ limit: 16 }),
    searchStores({ sortBy: "createdAt:desc", limit: 10 }),
  ]);

  const categories = sortCategoriesForDisplay(
    categoriesRaw.filter(isLikelyRealCategory),
  ).slice(0, 10);
  const onSale = curateProducts(onSaleRaw.items, 6);
  const mostViewed = curateProducts(mostViewedRaw.items, 6);
  const newArrivals = curateProducts(newArrivalsRaw.items, 4);
  const topRated = curateProducts(topRatedRaw.items, 6);
  const explore = curateProducts(exploreRaw.items, 12);
  const stores = sortStoresForDisplay(storesRaw.items.filter(isLikelyRealStore)).slice(0, 6);
  const newStores = newStoresRaw.items.filter(isLikelyRealStore).slice(0, 4);
  // Real totals still come from the unfiltered API pagination — the stats
  // band and merchant CTA are about the true catalog size, not the curated,
  // quality-filtered subset shown in the sections above.
  const totalProducts = exploreRaw.pagination.total;
  const totalStores = storesRaw.pagination.total;

  return (
    <div className="bg-white">
      <div className="bg-teal-600 py-2.5">
        <div className="oja-ticker-wrap">
          <div className="oja-ticker-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span
                key={i}
                className="mx-8 inline-flex items-center text-sm font-medium tracking-wide text-white sm:mx-10"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="oja-grid-bg mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <div className="flex min-h-[300px] gap-5 sm:h-[380px]">
          <div className="hidden w-56 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:flex">
            <div className="border-b border-gray-100 px-4 py-3">
              <span className="oja-display text-[11px] font-700 uppercase tracking-widest text-teal-600">
                Categories
              </span>
            </div>
            <div className="scrollbar-hide flex-1 overflow-y-auto py-1">
              {categories.slice(0, 10).map((category) => (
                <Link
                  key={category.id}
                  href={`/products?categoryIds=${category.id}`}
                  className="group flex items-center justify-between px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                >
                  <span>{category.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))}
              <Link
                href="/categories"
                className="oja-display flex items-center px-4 py-2 text-xs font-700 text-teal-600"
              >
                All Categories →
              </Link>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-2xl bg-teal-600 shadow-2xl shadow-teal-600/20">
            <div className="oja-grid-bg absolute inset-0 opacity-40" />
            <div className="relative flex h-full flex-col justify-center px-8 md:px-12">
              <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-600 uppercase tracking-widest text-teal-50">
                <Sparkles className="h-3 w-3" />
                Oja Square
              </span>
              <h1 className="oja-display mb-4 text-3xl font-800 leading-tight text-white md:text-4xl lg:text-5xl">
                Every store. <br />
                <span className="oja-shimmer-text">One Square.</span>
              </h1>
              <p className="mb-8 hidden max-w-sm text-sm text-teal-50 sm:block">
                Browse products from every independent merchant on Oja, then
                buy straight from the store that sells it.
              </p>
              <Link
                href="/products"
                className="group/btn inline-flex w-fit min-h-[44px] items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-700 text-teal-600 shadow-lg transition-all hover:bg-teal-50"
              >
                Start browsing
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="hidden w-52 flex-col gap-4 xl:flex">
            <a
              href={getSignupAsStoreOwnerUrl()}
              className="oja-card-hover relative flex flex-1 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 p-5"
            >
              <div className="oja-animate-float absolute right-3 top-3 text-3xl">
                🛍️
              </div>
              <h3 className="oja-display relative mb-1 text-sm font-700 text-white">
                Sell on Oja
              </h3>
              <p className="relative mb-3 text-[11px] text-white/80">
                Launch your store today.
              </p>
              <span className="relative w-fit rounded-full bg-white/20 px-3 py-1.5 text-center text-[11px] font-700 text-white transition-colors hover:bg-white/30">
                Get Started →
              </span>
            </a>
            <div className="oja-card-hover relative flex flex-1 flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5">
              <div
                className="oja-animate-float absolute right-3 top-3 text-3xl"
                style={{ animationDelay: "1s" }}
              >
                🏪
              </div>
              <h3 className="oja-display mb-1 text-sm font-700 text-white">
                Buy Direct
              </h3>
              <p className="text-[11px] text-white/80">
                No middleman — checkout with the merchant.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: ShieldCheck, label: "Paystack Secured", sub: "Trusted checkout" },
            { icon: StoreIcon, label: "Real Merchants", sub: "Every seller a real store" },
            { icon: Package, label: "Verified Stock", sub: "Active listings only" },
            { icon: Search, label: "One Search", sub: "Every store, one place" },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                <Icon className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-600 text-gray-800">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="my-6 bg-teal-600 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6">
            {[
              { icon: Package, value: totalProducts, label: "Products listed" },
              { icon: StoreIcon, value: totalStores, label: "Stores selling" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="oja-stat-card py-2 text-center text-white">
                <Icon className="mx-auto mb-2 h-6 w-6 text-teal-50 opacity-90" />
                <p className="oja-display text-2xl font-800 md:text-3xl">
                  {value.toLocaleString()}+
                </p>
                <p className="mt-1 text-xs text-teal-50">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by price — a real filter the API already supports
       * (`minPrice`/`maxPrice`) that had no entry point anywhere in the UI
       * until now. */}
      <section className="mx-auto max-w-7xl px-4 pb-2 pt-6 sm:px-6 lg:px-8">
        <p className="oja-display mb-3 text-xs font-700 uppercase tracking-widest text-gray-400">
          Browse by price
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Under ₦5,000", href: "/products?maxPrice=5000" },
            { label: "₦5,000 – ₦20,000", href: "/products?minPrice=5000&maxPrice=20000" },
            { label: "₦20,000 – ₦100,000", href: "/products?minPrice=20000&maxPrice=100000" },
            { label: "₦100,000+", href: "/products?minPrice=100000" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-teal-400 hover:text-teal-700"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionHeader
            icon={Tag}
            iconColor="text-teal-600"
            title="Shop by Category"
            sub="Find exactly what you're looking for"
            href="/categories"
          />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {categories.slice(0, 8).map((category, i) => (
              <CategoryCard key={category.id} category={category} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {onSale.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 p-6">
            <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <Zap className="h-6 w-6 fill-white text-white" />
                </div>
                <div>
                  <h2 className="oja-display text-xl font-800 text-white">On Sale</h2>
                  <p className="text-xs text-orange-100">
                    Discounted right now, across every store
                  </p>
                </div>
              </div>
              <Link
                href="/products?hasDiscount=true"
                className="w-fit rounded-full bg-white px-5 py-2.5 text-sm font-700 text-orange-600 transition-colors hover:bg-orange-50"
              >
                Shop the sale →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {onSale.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              bg: "from-violet-600 to-purple-500",
              icon: "⭐",
              title: "Top Rated",
              desc: "Products with the best reviews.",
              cta: "See picks",
              href: "/products?sortBy=rating:desc",
            },
            {
              bg: "from-amber-500 to-orange-400",
              icon: "🔥",
              title: "Trending Now",
              desc: "Most viewed products right now.",
              cta: "View trending",
              href: "/products?sortBy=viewCount:desc",
            },
            {
              bg: "from-teal-600 to-teal-700",
              icon: "🆕",
              title: "New Arrivals",
              desc: "Freshly listed by merchants.",
              cta: "See new",
              href: "/products?sortBy=createdAt:desc",
            },
          ].map(({ bg, icon, title, desc, cta, href }) => (
            <Link
              key={title}
              href={href}
              className={`oja-card-hover group relative overflow-hidden rounded-2xl bg-gradient-to-r ${bg} p-5`}
            >
              <div className="absolute right-4 top-4 text-4xl transition-transform group-hover:scale-110">
                {icon}
              </div>
              <h3 className="oja-display mb-1 text-base font-700 text-white">{title}</h3>
              <p className="mb-4 text-xs text-white/80">{desc}</p>
              <span className="inline-block rounded-full bg-white/20 px-3 py-1.5 text-xs font-700 text-white transition-colors group-hover:bg-white/30">
                {cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {mostViewed.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionHeader
            icon={Trophy}
            iconColor="text-amber-500"
            title="Most Viewed"
            sub="What buyers are looking at right now"
            href="/products?sortBy=viewCount:desc"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {mostViewed.map((product, i) => (
              <div key={product.id} className="relative">
                {i < 3 && (
                  <div
                    className={`oja-display absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-800 text-white shadow-md ${
                      i === 0 ? "bg-amber-400" : i === 1 ? "bg-gray-400" : "bg-amber-700"
                    }`}
                  >
                    {i + 1}
                  </div>
                )}
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {topRated.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionHeader
            icon={Star}
            iconColor="fill-amber-500 text-amber-500"
            title="Top Rated"
            sub="The best-reviewed products on Oja"
            href="/products?sortBy=rating:desc"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {topRated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="oja-grid-bg relative overflow-hidden rounded-3xl bg-teal-600 p-8">
            <div className="relative z-10 mb-8 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div>
                <span className="oja-display text-[11px] font-700 uppercase tracking-widest text-teal-50">
                  Just Listed
                </span>
                <h2 className="oja-display mt-1 text-2xl font-800 text-white">
                  New Arrivals
                </h2>
              </div>
              <Link
                href="/products?sortBy=createdAt:desc"
                className="flex items-center gap-1 text-sm font-600 text-white hover:underline"
              >
                Explore all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative z-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {stores.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionHeader
            icon={StoreIcon}
            iconColor="text-teal-600"
            title="Featured Stores"
            sub="Shop directly from independent merchants"
            href="/stores"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      {newStores.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionHeader
            icon={Sparkles}
            iconColor="text-teal-600"
            title="New Stores"
            sub="Recently opened, still worth a look"
            href="/stores?sortBy=createdAt:desc"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {newStores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="oja-grid-bg relative overflow-hidden rounded-3xl bg-teal-600 px-8 py-12 md:px-16 md:py-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal-50/15 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-10 lg:flex-row">
            <div className="max-w-lg text-center lg:text-left">
              <span className="oja-display mb-4 inline-block rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[11px] font-700 uppercase tracking-widest text-teal-50">
                For Merchants
              </span>
              <h2 className="oja-display mb-4 text-2xl font-800 leading-tight text-white md:text-3xl">
                Sell to every buyer <br className="hidden md:block" />
                browsing Oja Square
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-teal-50">
                Open your store, list your products, and reach buyers
                discovering merchants across Oja — not just your own storefront.
              </p>
              <a
                href={getSignupAsStoreOwnerUrl()}
                className="inline-block rounded-full bg-white px-6 py-3 text-sm font-700 text-teal-600 shadow-lg transition-colors hover:bg-teal-50"
              >
                Open your store
              </a>
            </div>

            <div className="hidden lg:block">
              <div className="oja-glass w-64 rounded-2xl p-7">
                {[
                  { step: "1", label: "Register your store" },
                  { step: "2", label: "Upload products" },
                  { step: "3", label: "Show up on Oja Square" },
                ].map(({ step, label }) => (
                  <div
                    key={step}
                    className={`flex items-center gap-4 ${step !== "3" ? "mb-5" : ""}`}
                  >
                    <div className="oja-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-800 text-teal-600 shadow-lg">
                      {step}
                    </div>
                    <span className="text-sm font-500 text-white">{label}</span>
                  </div>
                ))}
                <div className="mt-6 flex items-center gap-2 border-t border-white/20 pt-5">
                  <StoreIcon className="h-4 w-4 text-teal-50" />
                  <span className="text-[11px] text-teal-50">
                    {totalStores.toLocaleString()}+ stores already selling
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {explore.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="oja-display flex items-center gap-2 text-xl font-800 text-gray-900">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                Explore More
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                More listings from stores across Oja
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {explore.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-teal-600 px-8 py-3 text-sm font-600 text-teal-600 transition-all hover:bg-teal-600 hover:text-white"
            >
              Browse all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <section
        id="about-oja-square"
        className="relative overflow-hidden bg-teal-900"
        aria-labelledby="about-oja-square-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-teal-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-black/25 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="oja-display text-[11px] font-700 uppercase tracking-[0.22em] text-teal-200">
              What this is
            </p>
            <h2
              id="about-oja-square-heading"
              className="oja-display mt-4 text-3xl font-800 leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[3.25rem]"
            >
              One search, every store on Oja
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-teal-50 sm:text-lg">
              Oja Square is shared discovery: browse products from every
              independent store in one place, then check out with the merchant
              who actually sells it. Square never runs its own cart.
            </p>
          </div>

          <Link
            href="/products"
            className="group mt-8 flex max-w-xl min-h-[56px] items-center gap-3 rounded-full bg-white p-1.5 pl-5 shadow-xl shadow-black/20"
          >
            <Search className="h-5 w-5 shrink-0 text-teal-600" />
            <span className="min-w-0 flex-1 truncate text-sm text-gray-400 sm:text-base">
              Search every store on Oja
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-teal-600 px-5 py-2.5 text-sm font-700 text-white transition-colors group-hover:bg-teal-700">
              Search
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                icon: Search,
                title: "One search",
                body: "Skip hopping storefronts. Find it here, then buy on the merchant’s own shop — same Paystack checkout they already use.",
              },
              {
                n: "02",
                icon: ShieldCheck,
                title: "Every listing is real",
                body: "Only active, in-stock products appear. Drafts, pauses, and sold-out items never make the Square.",
              },
              {
                n: "03",
                icon: StoreIcon,
                title: "Sell once, show up everywhere",
                body: "Merchants don’t list twice. What’s live on their storefront is automatically what buyers find here.",
              },
            ].map(({ n, icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.11] sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-teal-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="oja-display text-xs font-700 tracking-widest text-white/35">
                    {n}
                  </span>
                </div>
                <h3 className="oja-display mt-5 text-xl font-800 text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-teal-50/90">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-teal-100">
              <span className="oja-display text-2xl font-800 text-white">
                {totalProducts.toLocaleString()}
              </span>{" "}
              products
              <span className="mx-3 text-white/30">·</span>
              <span className="oja-display text-2xl font-800 text-white">
                {totalStores.toLocaleString()}
              </span>{" "}
              stores
            </p>
            <Link
              href="/stores"
              className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-full border border-white/25 px-5 py-2.5 text-sm font-700 text-white transition-colors hover:bg-white/10"
            >
              Browse stores
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ — real answers, always rendered (not hidden behind an
       * accordion) so both search engines and AI answer engines see the
       * full text, plus mirrored as FAQPage JSON-LD below. */}
      <section
        id="faq"
        className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8"
        aria-labelledby="faq-heading"
      >
        <h2
          id="faq-heading"
          className="oja-display text-center text-2xl font-800 text-gray-900 sm:text-3xl"
        >
          Frequently asked questions
        </h2>
        <div className="mt-8 divide-y divide-gray-200">
          {HOME_FAQ.map((item) => (
            <div key={item.question} className="py-5">
              <h3 className="oja-display text-base font-700 text-gray-900">
                {item.question}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${getSiteUrl()}/#homepage-faq`,
          mainEntity: HOME_FAQ.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${getSiteUrl()}/#homepage-products`,
          name: "Products on Oja Square",
          itemListElement: explore.slice(0, 12).map((product, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${getStorefrontUrl(product.store.slug)}/product/${product.slug}`,
            name: product.name,
          })),
        }}
      />
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  iconColor,
  title,
  sub,
  href,
}: {
  icon: typeof Tag;
  iconColor: string;
  title: string;
  sub: string;
  href: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="oja-display flex items-center gap-2 text-xl font-800 text-gray-900">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </h2>
        <p className="mt-1 text-xs text-gray-500">{sub}</p>
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-600 text-teal-600 hover:underline"
      >
        View all <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
