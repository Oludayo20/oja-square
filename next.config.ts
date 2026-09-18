import type { NextConfig } from "next";

const MEDIA_PATHNAME = "/api/v1/cloud/media-file";

type ApiRemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

/**
 * Product images are not on a public CDN — the S3 bucket behind them is
 * private. Every image is served through a proxy/redirect route on the API
 * itself (`/api/v1/cloud/media-file?key=...`, see `oja-backend`'s
 * `cloud.controller.ts`), which 302s to a short-lived presigned S3 URL.
 * `next/image` must therefore be allow-listed against the API's own origin,
 * not against S3/CloudFront — see `oja-docs/OJA_MARKETPLACE_FEATURE.md` §2.1c.
 *
 * Product rows (and a local backend pointed at prod data) often return
 * absolute media-file URLs from the deployed API even when this app's
 * `NEXT_PUBLIC_ECOM_APP_API_URL` is localhost — so the allow-list is the
 * env origin plus the known deployed API hosts, not env alone.
 */
function patternFromApiUrl(raw: string): ApiRemotePattern | null {
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: MEDIA_PATHNAME,
    };
  } catch {
    return null;
  }
}

function apiRemotePatterns(): ApiRemotePattern[] {
  const patterns: ApiRemotePattern[] = [];
  const seen = new Set<string>();

  const add = (raw: string) => {
    const pattern = patternFromApiUrl(raw);
    if (!pattern) return;
    const key = `${pattern.protocol}://${pattern.hostname}:${pattern.port ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    patterns.push(pattern);
  };

  const env = (process.env.NEXT_PUBLIC_ECOM_APP_API_URL || "").trim();
  if (env) add(env);
  // Always keep the local-dev default — matches lib/ecom-api.ts's fallback.
  add("http://localhost:8084");
  add("https://api.useoja.com");

  patterns.push({
    protocol: "https",
    hostname: "**.ondigitalocean.app",
    pathname: MEDIA_PATHNAME,
  });

  return patterns;
}

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    qualities: [75, 85],
    // No `search` constraint: the `?key=...` query string is per-image and
    // can't be known in advance — omitting it allows any query string.
    remotePatterns: apiRemotePatterns(),
    // A local `oja-backend` resolves to a loopback IP, which Next's image
    // optimizer blocks by default as an SSRF guard (verified: every product
    // image 400s in local dev without this). Production's real API origin
    // resolves publicly, so this stays dev-only rather than a blanket
    // bypass — don't widen it to production "to be safe."
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
