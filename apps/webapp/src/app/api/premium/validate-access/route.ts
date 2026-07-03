import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/format/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DebugDetails = Record<string, string | number | boolean | null | undefined>;

function jsonError(message: string, status: number, code: string, details?: DebugDetails) {
  return NextResponse.json({ error: message, code, details }, { status });
}

function getSupabaseGrantErrorMessage(code?: string, message?: string) {
  const normalizedMessage = (message || "").toLowerCase();

  if (code === "42501" || normalizedMessage.includes("permission denied")) {
    return {
      code: "permission_denied",
      message:
        "A validação premium não tem permissão para ler access_grants. Confira se SUPABASE_SERVICE_ROLE_KEY é a service role real no Netlify.",
    };
  }

  if (code === "42P01" || normalizedMessage.includes("does not exist")) {
    return {
      code: "table_missing",
      message: "A tabela public.access_grants não foi encontrada neste projeto Supabase.",
    };
  }

  return {
    code: "grant_lookup_failed",
    message: "Não foi possível consultar o acesso premium agora.",
  };
}

function getSupabaseUpdateErrorMessage(code?: string, message?: string) {
  const normalizedMessage = (message || "").toLowerCase();

  if (code === "42501" || normalizedMessage.includes("permission denied")) {
    return {
      code: "permission_denied",
      message:
        "A validação premium não tem permissão para vincular o acesso. Confira se SUPABASE_SERVICE_ROLE_KEY é a service role real no Netlify.",
    };
  }

  return {
    code: "grant_update_failed",
    message: "Não foi possível vincular o acesso premium agora.",
  };
}

export async function POST(request: Request) {
  console.log("validate-access iniciado");

  const body = (await request.json().catch(() => null)) as { userId?: string; email?: string } | null;
  const requestedUserId = String(body?.userId || "");
  const requestedEmail = normalizeEmail(String(body?.email || ""));

  console.log("validate-access payload recebido", {
    requestedUserId,
    requestedEmail,
  });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("validate-access sem sessão", {
      message: userError?.message,
    });
    return jsonError("Sessão expirada. Entre novamente.", 401, "session", {
      supabaseMessage: userError?.message,
    });
  }

  const sessionEmail = normalizeEmail(user.email || "");
  const email = sessionEmail || requestedEmail;

  console.log("validate-access sessão autenticada", {
    receivedUserId: user.id,
    receivedUserEmail: email,
    requestedUserId,
    requestedEmail,
  });

  if (requestedUserId && requestedUserId !== user.id) {
    console.error("validate-access user_id diferente da sessão", {
      sessionUserId: user.id,
      requestedUserId,
    });
    await supabase.auth.signOut();
    return jsonError("Sessão inválida. Entre novamente.", 401, "session", {
      sessionUserId: user.id,
      requestedUserId,
    });
  }

  if (!email) {
    await supabase.auth.signOut();
    return jsonError("Não encontramos uma compra aprovada para este e-mail.", 403, "no_access", {
      reason: "missing_email",
    });
  }

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    console.log("validate-access env check", {
      hasSupabaseUrl,
      hasServiceRoleKey: Boolean(serviceRoleKey),
      serviceRoleKeyLooksPublishable: serviceRoleKey.startsWith("sb_publishable_"),
      serviceRoleKeyLooksSecret: serviceRoleKey.startsWith("sb_secret_"),
      serviceRoleKeyLooksJwt: serviceRoleKey.split(".").length === 3,
    });

    if (serviceRoleKey.startsWith("sb_publishable_")) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is a publishable key, not a service role/secret key.");
    }

    admin = createSupabaseAdminClient();
  } catch (error) {
    console.error("validate-access admin client config error", error);
    await supabase.auth.signOut();
    return jsonError(
      "A chave de validação premium do servidor está ausente ou inválida.",
      500,
      "admin_config_error",
      {
        message: error instanceof Error ? error.message : "unknown_error",
      },
    );
  }

  const { data: grant, error: grantError } = await admin
    .from("access_grants")
    .select("id,email,status,user_id")
    .ilike("email", email)
    .eq("status", "active")
    .maybeSingle();

  if (grantError) {
    const mappedError = getSupabaseGrantErrorMessage(grantError.code, grantError.message);

    console.error("validate-access erro ao consultar access_grants", {
      userId: user.id,
      email,
      code: grantError.code,
      message: grantError.message,
      result: mappedError.code,
    });
    await supabase.auth.signOut();
    return jsonError(mappedError.message, 500, mappedError.code, {
      supabaseCode: grantError.code,
      supabaseMessage: grantError.message,
    });
  }

  console.log("validate-access access_grants encontrado", {
    userId: user.id,
    email,
    found: Boolean(grant),
    grantId: grant?.id || null,
    currentUserId: grant?.user_id || null,
    currentStatus: grant?.status || null,
  });

  if (!grant) {
    console.log("validate-access resultado", {
      result: "blocked_no_access",
      redirectFinal: null,
    });
    await supabase.auth.signOut();
    return jsonError("Não encontramos uma compra aprovada para este e-mail.", 403, "no_access", {
      email,
      status: "active_not_found",
    });
  }

  if (grant.user_id && grant.user_id !== user.id) {
    console.log("validate-access resultado", {
      result: "blocked_linked_to_another_user",
      currentUserId: grant.user_id,
      receivedUserId: user.id,
      redirectFinal: null,
    });
    await supabase.auth.signOut();
    return jsonError("Este acesso já está vinculado a outra conta.", 403, "linked_to_another_user", {
      currentUserId: grant.user_id,
      receivedUserId: user.id,
    });
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
      const mappedError = getSupabaseUpdateErrorMessage(updateError.code, updateError.message);

      console.error("validate-access erro ao atualizar user_id", {
        userId: user.id,
        email,
        code: updateError.code,
        message: updateError.message,
        result: mappedError.code,
      });
      await supabase.auth.signOut();
      return jsonError(mappedError.message, 500, mappedError.code, {
        supabaseCode: updateError.code,
        supabaseMessage: updateError.message,
      });
    }

    console.log("validate-access user_id atualizado", {
      userId: user.id,
      email,
    });
  }

  console.log("validate-access resultado", {
    result: "allowed",
    userId: user.id,
    email,
    currentUserId: grant.user_id || user.id,
    currentStatus: grant.status,
    redirectFinal: "/app",
  });

  return NextResponse.json({ ok: true, redirectTo: "/app" });
}
