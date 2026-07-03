import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/format/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number, code: string) {
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(request: Request) {
  console.log("Premium validate access: request received");

  const body = (await request.json().catch(() => null)) as { userId?: string; email?: string } | null;
  const requestedUserId = String(body?.userId || "");
  const requestedEmail = normalizeEmail(String(body?.email || ""));

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Premium validate access: missing session", {
      message: userError?.message,
    });
    return jsonError("Sessão expirada. Entre novamente.", 401, "session");
  }

  const sessionEmail = normalizeEmail(user.email || "");
  const email = sessionEmail || requestedEmail;

  console.log("Premium validate access: auth session", {
    userId: user.id,
    email,
    requestedUserId,
    requestedEmail,
  });

  if (requestedUserId && requestedUserId !== user.id) {
    console.error("Premium validate access: user id mismatch", {
      sessionUserId: user.id,
      requestedUserId,
    });
    await supabase.auth.signOut();
    return jsonError("Sessão inválida. Entre novamente.", 401, "session");
  }

  if (!email) {
    await supabase.auth.signOut();
    return jsonError("Não encontramos uma compra aprovada para este e-mail.", 403, "no_access");
  }

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch (error) {
    console.error("Premium validate access: admin client config error", error);
    await supabase.auth.signOut();
    return jsonError("Não foi possível validar seu acesso agora. Tente novamente em instantes.", 500, "validation");
  }

  const { data: grant, error: grantError } = await admin
    .from("access_grants")
    .select("id,email,status,user_id")
    .ilike("email", email)
    .eq("status", "active")
    .maybeSingle();

  if (grantError) {
    console.error("Premium validate access: access_grants lookup failed", {
      userId: user.id,
      email,
      code: grantError.code,
      message: grantError.message,
    });
    await supabase.auth.signOut();
    return jsonError("Não foi possível validar seu acesso agora. Tente novamente em instantes.", 500, "validation");
  }

  console.log("Premium validate access: access_grants lookup", {
    userId: user.id,
    email,
    found: Boolean(grant),
    grantUserId: grant?.user_id || null,
  });

  if (!grant) {
    await supabase.auth.signOut();
    return jsonError("Não encontramos uma compra aprovada para este e-mail.", 403, "no_access");
  }

  if (grant.user_id && grant.user_id !== user.id) {
    await supabase.auth.signOut();
    return jsonError("Este acesso já está vinculado a outra conta.", 403, "linked_to_another_user");
  }

  if (!grant.user_id) {
    const { error: updateError } = await admin
      .from("access_grants")
      .update({
        user_id: user.id,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", grant.id);

    if (updateError) {
      console.error("Premium validate access: access_grants update failed", {
        userId: user.id,
        email,
        code: updateError.code,
        message: updateError.message,
      });
      await supabase.auth.signOut();
      return jsonError("Não foi possível validar seu acesso agora. Tente novamente em instantes.", 500, "validation");
    }

    console.log("Premium validate access: access_grants user_id updated", {
      userId: user.id,
      email,
    });
  }

  console.log("Premium validate access: redirect final", {
    userId: user.id,
    email,
    redirectTo: "/app",
  });

  return NextResponse.json({ ok: true, redirectTo: "/app" });
}
