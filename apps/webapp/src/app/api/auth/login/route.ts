import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { findActiveAccessGrant } from "@/lib/access-grants";
import { normalizeEmail } from "@/lib/format/email";
import {
  createPremiumSessionToken,
  getPremiumSessionCookieOptions,
  premiumSessionCookieName,
} from "@/lib/premium-session";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = normalizeEmail(String(body?.email || ""));
  const password = String(body?.password || "");

  console.log("auth/login iniciado", { email });

  if (!email || !password) {
    return jsonError("Informe seu e-mail e senha para entrar.", 400);
  }

  try {
    const auth = createSupabaseAuthClient();
    const { data: signInData, error: signInError } = await auth.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.user) {
      console.error("auth/login signIn error", {
        email,
        message: signInError?.message,
        status: signInError?.status,
      });
      return jsonError("E-mail ou senha incorretos.", 401);
    }

    const user = signInData.user;
    const userEmail = normalizeEmail(user.email || email);

    console.log("auth/login signIn success", {
      userId: user.id,
      email: userEmail,
    });

    const admin = createSupabaseAdmin();
    const { grant, error } = await findActiveAccessGrant(admin, userEmail);

    console.log("auth/login access_grants resultado", {
      email: userEmail,
      userId: user.id,
      found: Boolean(grant),
      statusEncontrado: grant?.normalizedStatus || null,
      userIdEncontrado: grant?.normalizedUserId || null,
    });

    if (error) {
      console.error("auth/login access lookup failed", {
        email: userEmail,
        code: error.code,
        message: error.message,
      });
      return jsonError("Não conseguimos concluir agora. Tente novamente em alguns instantes.", 500);
    }

    if (!grant) {
      return jsonError("Seu acesso ainda não foi liberado.", 403);
    }

    if (grant.normalizedUserId && grant.normalizedUserId !== user.id) {
      return jsonError("Este acesso já está vinculado a outra conta.", 403);
    }

    if (!grant.normalizedUserId) {
      const { error: updateError } = await admin
        .from("access_grants")
        .update({
          user_id: user.id,
          email: userEmail,
          updated_at: new Date().toISOString(),
        })
        .eq("id", grant.id);

      if (updateError) {
        console.error("auth/login grant update failed", {
          email: userEmail,
          userId: user.id,
          code: updateError.code,
          message: updateError.message,
        });
        return jsonError("Não conseguimos concluir agora. Tente novamente em alguns instantes.", 500);
      }

      console.log("auth/login user_id vinculado", {
        email: userEmail,
        userId: user.id,
      });
    }

    const token = createPremiumSessionToken(user.id, userEmail);
    const cookieStore = await cookies();
    cookieStore.set(premiumSessionCookieName, token, getPremiumSessionCookieOptions());

    console.log("auth/login decisão final", {
      decision: "allowed",
      redirectTo: "/dashboard",
      userId: user.id,
      email: userEmail,
    });

    return NextResponse.json({ ok: true, redirectTo: "/dashboard" });
  } catch (error) {
    console.error("auth/login unexpected error", error);
    return jsonError("Não conseguimos concluir agora. Tente novamente em alguns instantes.", 500);
  }
}
