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
 * Same-row cards match height regardless of content length: the name is
 * clamped to 2 lines, everything else truncates, and the grid's default
 * `align-items: stretch` plus `h-full` here equalizes card height.
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
        {rating > 0 && (
          <span className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 shadow-sm">
            <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
            {rating.toFixed(1)}
          </span>
        )}
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-800 text-white oja-display">
            SALE
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <span className="min-w-0 truncate text-[10px] font-bold uppercase tracking-wide text-gray-400">
            {product.category?.name ?? "General"}
          </span>
          <a
            href={getStorefrontUrl(product.store.slug)}
            className="flex min-w-0 items-center gap-1 text-[10px] font-black uppercase text-teal-700 hover:underline sm:max-w-[55%] sm:shrink-0"
          >
            <StoreIcon className="h-3 w-3 shrink-0" />
            <span className="truncate">{product.store.name}</span>
          </a>
        </div>

        <Link
          href={getStorefrontUrl(product.store.slug) + `/product/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-teal-700"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <div className="flex min-w-0 items-baseline gap-2">
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
            className="block w-full rounded-full bg-teal-600 px-3 py-2 text-center text-xs font-bold text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700"
          >
            Buy
          </a>
        </div>
      </div>
    </div>
  );
}
