import { NextResponse } from "next/server";
import { getPremiumSession } from "@/lib/premium-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getPremiumSession();

  console.log("auth/me resultado", {
    authenticated: Boolean(session),
    email: session?.email || null,
    userId: session?.user_id || null,
  });

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
    userId: session.user_id,
  });
}
