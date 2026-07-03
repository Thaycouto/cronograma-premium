import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { premiumSessionCookieName } from "@/lib/premium-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSafeNextUrl(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next") || "/login";

  return next.startsWith("/") && !next.startsWith("//") ? next : "/login";
}

async function clearPremiumSession(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(premiumSessionCookieName);

  const redirectTo = getSafeNextUrl(request);
  console.log("auth/logout chp_session apagado", { redirectTo });

  return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
}

export async function POST(request: Request) {
  return clearPremiumSession(request);
}

export async function GET(request: Request) {
  return clearPremiumSession(request);
}
