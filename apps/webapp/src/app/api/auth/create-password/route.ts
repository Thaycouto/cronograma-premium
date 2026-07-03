import { NextResponse } from "next/server";
import { findActiveAccessGrant } from "@/lib/access-grants";
import { normalizeEmail } from "@/lib/format/email";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isExistingUserError(errorMessage?: string) {
  const normalizedMessage = (errorMessage || "").toLowerCase();
  return (
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already exists") ||
    normalizedMessage.includes("user already")
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = normalizeEmail(String(body?.email || ""));
  const password = String(body?.password || "");

  if (!email || password.length < 6) {
    return jsonError("Informe um e-mail válido e uma senha com pelo menos 6 caracteres.", 400);
  }

  try {
    const admin = createSupabaseAdmin();
    const { grant, error } = await findActiveAccessGrant(admin, email);

    if (error) {
      console.error("auth/create-password access lookup failed", {
        email,
        code: error.code,
        message: error.message,
      });
      return jsonError("Não conseguimos concluir agora. Tente novamente em alguns instantes.", 500);
    }

    if (!grant) {
      return jsonError("Não encontramos uma compra aprovada para este e-mail.", 403);
    }

    if (grant.normalizedUserId) {
      return jsonError("Este e-mail já tem senha criada. Faça login para continuar.", 409);
    }

    const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        source: "manual_or_kiwify",
        premium_access: true,
      },
    });

    if (createUserError || !createdUser.user) {
      console.error("auth/create-password create user failed", {
        email,
        message: createUserError?.message,
        status: createUserError?.status,
      });

      if (isExistingUserError(createUserError?.message)) {
        return jsonError("Este e-mail já tem senha criada. Faça login para continuar.", 409);
      }

      return jsonError("Não conseguimos concluir agora. Tente novamente em alguns instantes.", 500);
    }

    const { error: updateError } = await admin
      .from("access_grants")
      .update({
        user_id: createdUser.user.id,
        email,
        updated_at: new Date().toISOString(),
      })
      .eq("id", grant.id);

    if (updateError) {
      console.error("auth/create-password grant update failed", {
        email,
        userId: createdUser.user.id,
        code: updateError.code,
        message: updateError.message,
      });
      return jsonError("Não conseguimos concluir agora. Tente novamente em alguns instantes.", 500);
    }

    return NextResponse.json({ ok: true, redirectTo: "/login?senha=criada" });
  } catch (error) {
    console.error("auth/create-password unexpected error", error);
    return jsonError("Não conseguimos concluir agora. Tente novamente em alguns instantes.", 500);
  }
}
