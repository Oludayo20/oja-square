/**
 * Types matched against `oja-backend`'s actual controller responses
 * (`product.controller.ts`, `store/storeCrud.controller.ts`,
 * `category.controller.ts`, `search.controller.ts`): not a port of
 * `oja-frontend`'s broader Product/Store types, most of which cover
 * merchant-dashboard fields this read-only app never touches.
 *
 * `oja-backend` has a partial, hand-maintained OpenAPI spec
 * (`src/swagger/index.ts`) covering `/product/search` and
 * `/category/marketplace`: useful as a cross-check, not as a source of
 * truth (it doesn't cover `/store` or `/search`, and can drift from the
 * real implementation). See §2.1c.
 */

export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  code: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

/** Sort format the backend expects: `field:direction`, e.g. `createdAt:desc`. */
export type SortBy = string;

// ---------------------------------------------------------------------------
// Products: GET /product/search response shape (product.controller.ts,
// `getAllProducts`'s `include`)
// ---------------------------------------------------------------------------

export interface MarketplaceProductStore {
  id: string;
  name: string;
  logoUrl: string | null;
  slug: string;
}

export interface MarketplaceProductCategory {
  id: string;
  name: string;
}

export interface MarketplaceProductBrand {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface MarketplaceProductInventory {
  id: string;
  quantity: number;
  trackQuantity: boolean;
}

export interface MarketplaceProductDiscount {
  discountLinks?: Array<{
    discount: {
      id: string;
      name: string;
      percentage?: number | null;
      amount?: number | null;
    };
  }>;
}

export interface MarketplaceProduct extends MarketplaceProductDiscount {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "ARCHIVED";
  price: string; // Prisma Decimal serializes as a numeric string
  currency: string;
  discountedPrice: string | null;
  imageUrls: string[];
  thumbnail?: string | null;
  rating: string | null;
  totalReviews: number;
  viewCount: number;
  soldCount: number;
  store: MarketplaceProductStore;
  category: MarketplaceProductCategory | null;
  brand: MarketplaceProductBrand | null;
  inventory: MarketplaceProductInventory | null;
  _count: { reviews: number; orderItems: number };
  createdAt: string;
  updatedAt: string;
}

export interface ProductSearchParams {
  search?: string;
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  hasDiscount?: boolean;
  sortBy?: SortBy;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Stores: GET /store response shape (storeCrud.controller.ts, `getAll`)
// ---------------------------------------------------------------------------

export interface MarketplaceStoreOwner {
  id: string;
  name: string;
  avatar: string | null;
}

export interface MarketplaceStoreVerification {
  address?: string | null;
  [key: string]: unknown;
}

/**
 * `owner`, `verification`, and `_count` are only present on `GET /store`'s
 * curated response: `GET /search` returns a much rawer `Store` row (nearly
 * the full Prisma model, no aggregates) for the same field. Both real
 * shapes flow through `StoreCard`, so these stay optional rather than
 * assumed: see `components/StoreCard.tsx`.
 */
export interface MarketplaceStore {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  /** Store's own contact email: optional field, often left blank even by
   * real merchants. Present in the raw response on both `/store` and
   * `/search` (confirmed against real data); not previously typed here
   * because nothing used it until `lib/quality.ts`'s dummy-data check. */
  email?: string | null;
  owner?: MarketplaceStoreOwner | null;
  verification?: MarketplaceStoreVerification | null;
  _count?: { products: number; followers: number };
  createdAt: string;
  updatedAt: string;
}

export interface StoreSearchParams {
  search?: string;
  sortBy?: SortBy;
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Categories: GET /category/marketplace response shape
// (category.controller.ts, `listCategoriesForMarketplace`)
// ---------------------------------------------------------------------------

export interface MarketplaceCategory {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  _count: { products: number };
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Search: GET /search response shape (search.controller.ts, `searchAll`)
// ---------------------------------------------------------------------------

export interface GlobalSearchResult {
  products: MarketplaceProduct[];
  categories: MarketplaceCategory[];
  stores: MarketplaceStore[];
  // `orders` is deliberately not typed here: Oja Square never requests it
  // (calls without credentials) and never renders it. See §2.1c.
}
