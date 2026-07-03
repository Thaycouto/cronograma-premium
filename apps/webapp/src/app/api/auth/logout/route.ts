import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { premiumSessionCookieName } from "@/lib/premium-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(premiumSessionCookieName);

  return NextResponse.redirect(new URL("/login", request.url), { status: 303 });
}
