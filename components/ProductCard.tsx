import Image from "next/image";
import Link from "next/link";
import { Package, Star, Store as StoreIcon } from "lucide-react";
import { getPrimaryImageUrl } from "@/lib/ecom-api";
import { getStorefrontUrl, getStoreHandoffCheckoutUrl } from "@/lib/oja-links";
import type { MarketplaceProduct } from "@/lib/types";

function formatNaira(value: string | number) {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Fixed layout so every product card is the same size regardless of content
 * length: the name is clamped to a reserved 2-line height (not just
 * clamped-but-collapsible), the rating row always renders (a placeholder
 * line when there's no rating yet, not an absent row), and everything that
 * can overflow truncates instead of stretching the card. Combined with the
 * grid's default `align-items: stretch`, `h-full` here is what actually
 * makes same-row cards match height even when one has less content.
 *
 * The buy action is not "add to a marketplace cart": it's a plain link to
 * the product's own store checkout (§3.2, §5.2). No client JS needed: the
 * URL is computed server-side, and the store subdomain's own `Checkout.tsx`
 * does the actual cart-adding once the buyer lands there.
 */
export default function ProductCard({
  product,
  priority = false,
}: {
  product: MarketplaceProduct;
  /** Set for the first few above-the-fold cards only. Preloads the image
   * instead of lazy-loading it, which is what actually helps Largest
   * Contentful Paint. Passing it on every card would defeat the point. */
  priority?: boolean;
}) {
  const image = getPrimaryImageUrl(product);
  const price = product.discountedPrice ?? product.price;
  const hasDiscount = Boolean(product.discountedPrice);
  const rating = Number(product.rating);

  return (
    <div className="oja-card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <Link
        href={getStorefrontUrl(product.store.slug) + `/product/${product.slug}`}
        className="group relative block aspect-square shrink-0 overflow-hidden bg-gray-50"
      >
        {image ? (
          <Image
            src={image}
            alt={`${product.name} from ${product.store.name} on Oja Square`}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // Product placeholder: Package icon, distinct from the Tag used
          // for categories and the Store icon used for stores, so a blank
          // card still reads as "this is a product" at a glance.
          <div className="flex h-full w-full items-center justify-center bg-gray-50">
            <Package className="h-10 w-10 text-gray-300" />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-800 text-white oja-display">
            SALE
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[10px] font-bold uppercase tracking-wide text-gray-400">
            {product.category?.name ?? "General"}
          </span>
          <a
            href={getStorefrontUrl(product.store.slug)}
            className="flex shrink-0 items-center gap-1 truncate text-[10px] font-black uppercase text-teal-700 hover:underline"
          >
            <StoreIcon className="h-3 w-3 shrink-0" />
            <span className="truncate">{product.store.name}</span>
          </a>
        </div>

        <Link
          href={getStorefrontUrl(product.store.slug) + `/product/${product.slug}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-gray-900 hover:text-teal-700"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          {rating > 0 ? (
            <>
              <Star className="h-3 w-3 shrink-0 fill-amber-500 text-amber-500" />
              <span className="truncate">
                {rating.toFixed(1)} ({product.totalReviews})
              </span>
            </>
          ) : (
            <span className="text-gray-300">No ratings yet</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex min-w-0 flex-col">
            <span className="oja-display truncate text-base font-800 text-gray-900">
              {formatNaira(price)}
            </span>
            {hasDiscount && (
              <span className="truncate text-xs text-gray-400 line-through">
                {formatNaira(product.price)}
              </span>
            )}
          </div>

          <a
            href={getStoreHandoffCheckoutUrl({
              storeSlug: product.store.slug,
              productId: product.id,
            })}
            className="shrink-0 rounded-full bg-teal-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700"
          >
            Buy
          </a>
        </div>
      </div>
    </div>
  );
}
