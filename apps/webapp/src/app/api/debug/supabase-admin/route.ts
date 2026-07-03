import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getServiceKeyPrefix(serviceKey?: string) {
  if (!serviceKey) {
    return null;
  }

  if (serviceKey.startsWith("sb_secret_")) {
    return "sb_secret_";
  }

  if (serviceKey.startsWith("sb_publishable_")) {
    return "sb_publishable_";
  }

  if (serviceKey.split(".").length === 3) {
    return "jwt";
  }

  return "other";
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let accessQueryOk = false;
  let accessQueryError: string | null = null;

  try {
    const admin = createSupabaseAdmin();
    const { error } = await admin.from("access_grants").select("id", { count: "exact", head: true });

    accessQueryOk = !error;
    accessQueryError = error?.message || null;
  } catch (error) {
    accessQueryOk = false;
    accessQueryError = error instanceof Error ? error.message : "Unknown admin client error";
  }

  return NextResponse.json({
    hasUrl: Boolean(supabaseUrl),
    hasServiceKey: Boolean(serviceKey),
    serviceKeyPrefix: getServiceKeyPrefix(serviceKey),
    accessQueryOk,
    accessQueryError,
  });
}
