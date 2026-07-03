import { NextResponse } from "next/server";
import { findActiveAccessGrant } from "@/lib/access-grants";
import { normalizeEmail } from "@/lib/format/email";
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

  return "outro";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const emailReceived = url.searchParams.get("email") || "";
  const normalizedEmail = normalizeEmail(emailReceived);
  const token = url.searchParams.get("token") || "";
  const expectedToken = process.env.PREVIEW_ACCESS_TOKEN || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let accessGrantFound = false;
  let accessStatus: string | null = null;
  let accessUserId: string | null = null;
  let authUserFound = false;
  let authUserId: string | null = null;
  let decision: "would_allow" | "would_block" = "would_block";
  let reason = "access_not_found";

  try {
    const admin = createSupabaseAdmin();
    const { grant, error } = await findActiveAccessGrant(admin, normalizedEmail);

    if (error) {
      reason = error.message;
    }

    if (grant) {
      accessGrantFound = true;
      accessStatus = grant.normalizedStatus;
      accessUserId = grant.normalizedUserId;
      reason = "active_access_found";
    }

    if (normalizedEmail) {
      const { data } = await admin.auth.admin.listUsers();
      const authUser = data.users.find((user) => normalizeEmail(user.email || "") === normalizedEmail);
      authUserFound = Boolean(authUser);
      authUserId = authUser?.id || null;
    }

    if (grant && (!grant.normalizedUserId || (authUserId && grant.normalizedUserId === authUserId))) {
      decision = "would_allow";
      reason = "email_status_active_user_id_ok";
    } else if (grant && grant.normalizedUserId && authUserId && grant.normalizedUserId !== authUserId) {
      reason = "access_linked_to_another_user";
    } else if (grant && grant.normalizedUserId && !authUserId) {
      decision = "would_allow";
      reason = "active_access_found_auth_user_not_required_for_manual_check";
    }
  } catch (error) {
    reason = error instanceof Error ? error.message : "debug_failed";
  }

  return NextResponse.json({
    emailReceived,
    normalizedEmail,
    hasServiceKey: Boolean(serviceKey),
    serviceKeyPrefix: getServiceKeyPrefix(serviceKey),
    accessGrantFound,
    accessStatus,
    accessUserId,
    authUserFound,
    authUserId,
    decision,
    reason,
  });
}
