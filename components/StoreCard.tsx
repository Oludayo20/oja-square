import Image from "next/image";
import { MapPin, Package, Store as StoreIconGlyph } from "lucide-react";
import { getMediaUrl } from "@/lib/ecom-api";
import { getStorefrontUrl } from "@/lib/oja-links";
import type { MarketplaceStore } from "@/lib/types";

/**
 * Fixed layout, same reasoning as `ProductCard`/`CategoryCard`: `h-full` +
 * truncated/clamped text + an always-rendered (if sometimes empty)
 * description block means store cards in the same row match height
 * whether or not a given store filled in a bio, address, or logo.
 */
export default function StoreCard({
  store,
  priority = false,
}: {
  store: MarketplaceStore;
  priority?: boolean;
}) {
  const logo = getMediaUrl(store.logoUrl);

  return (
    <a
      href={getStorefrontUrl(store.slug)}
      className="oja-card-hover flex h-full flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-teal-50 ring-2 ring-white">
          {logo ? (
            <Image
              src={logo}
              alt={`${store.name} logo, a store on Oja Square`}
              fill
              priority={priority}
              className="object-cover"
            />
          ) : (
            // Store placeholder: Store icon, distinct from Package
            // (products) and Tag (categories).
            <div className="flex h-full w-full items-center justify-center">
              <StoreIconGlyph className="h-5 w-5 text-teal-300" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="oja-display truncate font-700 text-gray-900">{store.name}</p>
          <p className="flex min-h-[1rem] items-center gap-1 truncate text-xs text-gray-500">
            {store.verification?.address && (
              <>
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{store.verification.address}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <p className="line-clamp-2 min-h-[2.5rem] text-sm text-gray-600">
        {store.description ?? ""}
      </p>

      {store._count && (
        <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-teal-700">
          <Package className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {store._count.products} product{store._count.products === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </a>
  );
}
