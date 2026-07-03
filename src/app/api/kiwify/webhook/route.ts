import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const configuredSecret = process.env.KIWIFY_WEBHOOK_SECRET;
  const receivedSecret = request.headers.get("x-kiwify-secret");

  if (!configuredSecret || receivedSecret !== configuredSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const email = payload?.customer?.email || payload?.Customer?.email || payload?.email;

  if (!email) {
    return NextResponse.json({ error: "Missing customer email" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  await supabase.from("premium_access").upsert(
    {
      email,
      provider: "kiwify",
      active: true,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );

  return NextResponse.json({ received: true });
}
