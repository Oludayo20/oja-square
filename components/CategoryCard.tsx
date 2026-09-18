import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";
import { getMediaUrl } from "@/lib/ecom-api";
import type { MarketplaceCategory } from "@/lib/types";

/**
 * Fixed layout, same reasoning as `ProductCard`: `h-full` + a fixed avatar
 * size + single-line truncated name means every category card in a row
 * ends up the same size regardless of name length or whether it has an
 * image.
 */
export default function CategoryCard({ category }: { category: MarketplaceCategory }) {
  const image = getMediaUrl(category.imageUrl);

  return (
    <Link
      href={`/products?categoryIds=${category.id}`}
      className="oja-card-hover group flex h-full flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-teal-50 ring-2 ring-white transition-transform group-hover:scale-105">
        {image ? (
          <Image src={image} alt={category.name} fill className="object-cover" />
        ) : (
          // Category placeholder: Tag icon — distinct from Package
          // (products) and Store (stores).
          <div className="flex h-full w-full items-center justify-center">
            <Tag className="h-6 w-6 text-teal-300" />
          </div>
        )}
      </div>
      <p className="line-clamp-2 min-h-[2.25rem] text-sm font-bold text-gray-900 group-hover:text-teal-700">
        {category.name}
      </p>
      <p className="mt-auto truncate text-xs text-gray-500">
        {category._count.products} product{category._count.products === 1 ? "" : "s"}
      </p>
    </Link>
  );
}
