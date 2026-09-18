"use client";

import { useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { getSignupAsStoreOwnerUrl } from "@/lib/oja-links";

const DISMISS_KEY = "oja-square:sticky-sell-banner-dismissed";

function subscribe() {
  // Nothing external to subscribe to. This component's own state changes
  // (clicking dismiss) already trigger the re-render that re-checks
  // localStorage. A no-op is all useSyncExternalStore needs here.
  return () => {};
}

function getSnapshot(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  // The server can't read localStorage, so always render "visible" so the
  // client's first hydration pass matches the server HTML exactly. Reading
  // localStorage in a useEffect and calling setState from it would avoid
  // the mismatch too, but trips the set-state-in-effect lint rule and adds
  // an extra render pass; useSyncExternalStore is the sanctioned way to
  // read external, client-only state without either problem.
  return false;
}

/**
 * Sticky, site-wide "sell on Oja Square" CTA, distinct from the in-page
 * `SellBanner` (§5.3), which only appears on a few pages inline. This one
 * follows the visitor everywhere, so it has to earn that by staying out of
 * the way:
 *
 * - Dismissible, and remembered via localStorage. Closing it once means
 *   never seeing it again on this device, not "until the next page load."
 * - A trailing spacer of the same height as the fixed bar keeps it from
 *   permanently covering the last bit of the footer once someone scrolls
 *   to the bottom of a page. Without it, `fixed` content just sits on top
 *   of whatever's there.
 * - No visibility check for "already a merchant" (same reasoning as
 *   `SellBanner`): Oja Square has no session/auth state to check by design.
 */
export default function StickySellBanner() {
  const dismissedInStorage = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [dismissedThisClick, setDismissedThisClick] = useState(false);
  const dismissed = dismissedInStorage || dismissedThisClick;

  function dismiss() {
    setDismissedThisClick(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Not persisted this time, but still dismissed for the current visit.
    }
  }

  if (dismissed) return null;

  return (
    <>
      {/* Reserves the fixed bar's height in normal document flow so it
       * never permanently covers the footer at the bottom of the page. */}
      <div className="h-16 sm:h-14" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-teal-700 bg-teal-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <p className="min-w-0 truncate text-xs font-semibold text-teal-50 sm:text-sm">
            Got something to sell?{" "}
            <span className="hidden sm:inline">
              Open your store and reach every buyer on{" "}
            </span>
            Oja Square.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={getSignupAsStoreOwnerUrl()}
              className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-50 sm:px-4 sm:text-sm"
            >
              Sell on Oja Square
            </a>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="rounded-full p-1.5 text-teal-100 hover:bg-teal-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
