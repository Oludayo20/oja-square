import { NextResponse } from "next/server";
import { EcomApiError, ecomFetch } from "@/lib/ecom-api";
import type { ApiResponse } from "@/lib/types";

export async function POST(req: Request) {
  let email = "";
  try {
    const body = (await req.json()) as { email?: string };
    email = body.email?.trim() ?? "";
  } catch {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  try {
    const res = await ecomFetch<ApiResponse<unknown>>("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return NextResponse.json(res);
  } catch (error) {
    const status = error instanceof EcomApiError ? error.status : 500;
    return NextResponse.json(
      { message: "Subscription failed. Please try again." },
      { status },
    );
  }
}
