import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "@/lib/types";

/** Plain `<Link>`s (no client state). Page changes are just URL changes. */
export default function Pagination({
  pagination,
  basePath,
  searchParams,
}: {
  pagination: PaginationMeta;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (pagination.totalPages <= 1) return null;

  function hrefFor(page: number) {
    const qs = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v !== undefined) as [
        string,
        string,
      ][],
    );
    qs.set("page", String(page));
    return `${basePath}?${qs.toString()}`;
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <Link
        href={hrefFor(pagination.page - 1)}
        aria-disabled={!pagination.hasPreviousPage}
        className={`rounded-lg border border-gray-200 p-2 ${
          pagination.hasPreviousPage
            ? "hover:border-teal-400 hover:bg-teal-50"
            : "pointer-events-none opacity-30"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="text-sm font-semibold text-gray-600">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <Link
        href={hrefFor(pagination.page + 1)}
        aria-disabled={!pagination.hasNextPage}
        className={`rounded-lg border border-gray-200 p-2 ${
          pagination.hasNextPage
            ? "hover:border-teal-400 hover:bg-teal-50"
            : "pointer-events-none opacity-30"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
