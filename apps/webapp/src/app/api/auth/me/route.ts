import { NextResponse } from "next/server";
import { getPremiumSession } from "@/lib/premium-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getPremiumSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user_id,
      email: session.email,
    },
  });
}
