import { NextRequest, NextResponse } from "next/server";
import { globalSearch } from "@/lib/api/search";

/**
 * Client typeahead proxy so the nav never has to call oja-backend from the
 * browser (CORS). `globalSearch()` already applies `lib/quality.ts`'s
 * dummy-data filter — nothing to add here.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const data = await globalSearch(q);
  return NextResponse.json(data);
}
