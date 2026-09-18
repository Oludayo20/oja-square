/**
 * `oja-backend` API access. Same `NEXT_PUBLIC_ECOM_APP_API_URL` convention
 * `oja-landing-page/lib/ecom-api.ts` already uses: shared env-var name
 * across the repo family, not shared code.
 */

function trimTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, "");
}

/** API origin with no path (e.g. `https://api.useoja.com`). */
export function getEcomApiOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_ECOM_APP_API_URL || "").trim();
  if (!raw) return "http://localhost:8084";
  let s = trimTrailingSlashes(raw);
  if (/\/api\/v1$/i.test(s)) {
    s = trimTrailingSlashes(s.replace(/\/api\/v1$/i, ""));
  }
  return s;
}

/** Versioned REST base ending with `/api/v1`. */
export function getEcomApiV1BaseUrl(): string {
  return `${getEcomApiOrigin()}/api/v1`;
}

/**
 * If `ref` is already a `/cloud/media-file` proxy URL from any API host
 * (local, DigitalOcean App Platform, api.useoja.com), rebuild it against
 * this app's configured origin so `next/image` remotePatterns match.
 * Other absolute URLs (legacy Cloudinary, etc.) pass through unchanged.
 */
function mediaFileKeyFromAbsoluteUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    const path = url.pathname.replace(/\/+$/, "");
    if (!path.endsWith("/cloud/media-file")) return null;
    const keyParam = url.searchParams.get("key")?.trim();
    if (!keyParam) return null;
    return keyParam.replace(/^\//, "");
  } catch {
    return null;
  }
}

/**
 * Public URL for a stored product/store image ref (an S3 object key).
 * The bucket is private: every image is served through the API's own
 * presigned-redirect proxy, not a public CDN URL. See `next.config.ts` and
 * `oja-docs/OJA_MARKETPLACE_FEATURE.md` §2.1c.
 */
export function getMediaUrl(ref: string | null | undefined): string {
  const key = ref?.trim();
  if (!key) return "";
  if (key.startsWith("http://") || key.startsWith("https://")) {
    const extracted = mediaFileKeyFromAbsoluteUrl(key);
    if (!extracted) return key;
    return `${getEcomApiV1BaseUrl()}/cloud/media-file?key=${encodeURIComponent(extracted)}`;
  }
  return `${getEcomApiV1BaseUrl()}/cloud/media-file?key=${encodeURIComponent(key)}`;
}

/** Primary display image for a product-like record (thumbnail, else first gallery image). */
export function getPrimaryImageUrl(input: {
  thumbnail?: string | null;
  imageUrls?: string[] | null;
}): string {
  const thumb = input.thumbnail?.trim();
  if (thumb) return getMediaUrl(thumb);
  const first = (input.imageUrls ?? []).find((u) => u?.trim());
  return first ? getMediaUrl(first) : "";
}

export class EcomApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "EcomApiError";
  }
}

interface EcomFetchOptions extends RequestInit {
  /** Next.js fetch cache revalidation window, in seconds. Omit for `no-store`. */
  revalidateSeconds?: number;
}

/**
 * Fetch a versioned API endpoint. Deliberately never forwards cookies:
 * every Oja Square page is public and anonymous by design (§2.1, §2.1c);
 * a credentialed request here would make responses vary per-viewer and
 * break caching for no benefit this app needs.
 */
export async function ecomFetch<T>(
  path: string,
  { revalidateSeconds, ...init }: EcomFetchOptions = {},
): Promise<T> {
  const url = path.startsWith("http")
    ? path
    : `${getEcomApiV1BaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...init,
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    next:
      revalidateSeconds === undefined
        ? undefined
        : { revalidate: revalidateSeconds },
    cache: revalidateSeconds === undefined ? "no-store" : undefined,
  });

  if (!res.ok) {
    throw new EcomApiError(`${path} failed with ${res.status}`, res.status);
  }

  return res.json() as Promise<T>;
}
