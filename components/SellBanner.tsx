import { ArrowRight } from "lucide-react";
import { getSignupAsStoreOwnerUrl } from "@/lib/oja-links";

/**
 * §5.3 — Oja's own growth loop, not a third-party ad. Compact variant for
 * `/products`, `/stores`, `/categories` — the home page gets its own,
 * larger "Merchant CTA" section instead (`app/page.tsx`), matching
 * `oja-frontend`'s `Home.tsx` treatment for that spot.
 *
 * No visibility check for "already a merchant": Oja Square has no
 * session/auth state to check against (§2.1c), so this is a static,
 * always-shown CTA rather than a conditionally-rendered one — a signed-in
 * merchant seeing "open your store" once in a while is a much smaller cost
 * than giving this public, cacheable page per-viewer variance.
 */
export default function SellBanner() {
  return (
    <a
      href={getSignupAsStoreOwnerUrl()}
      className="group flex items-center justify-between gap-4 rounded-2xl bg-teal-600 px-6 py-5 text-white shadow-sm transition-colors hover:bg-teal-700"
    >
      <div>
        <p className="oja-display text-lg font-800">Got something to sell?</p>
        <p className="text-sm text-teal-50">
          Open your store on Oja and reach every buyer on Oja Square.
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-bold text-teal-600">
        Get started
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </a>
  );
}
