import { NextResponse } from "next/server";
import { findActiveAccessGrant } from "@/lib/access-grants";
import { normalizeEmail } from "@/lib/format/email";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseAuthClient } from "@/lib/supabase-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const genericResponse = {
  ok: true,
  message: "Se houver uma conta com acesso ativo para este e-mail, enviaremos um link de recuperação.",
};

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = normalizeEmail(String(body?.email || ""));

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Informe um e-mail válido." }, 400);
  }

  try {
    const { grant, error: grantError } = await findActiveAccessGrant(createSupabaseAdmin(), email);

    if (grantError) {
      console.error("auth/request-password-reset access lookup failed", {
        code: grantError.code,
        message: grantError.message,
      });
      return json({ error: "Não conseguimos verificar o acesso agora. Tente novamente mais tarde." }, 503);
    }

    // Give the same public response for unknown and inactive accounts.
    if (!grant) {
      return json(genericResponse);
    }

    const auth = createSupabaseAuthClient();
    const { error } = await auth.auth.resetPasswordForEmail(email, {
      redirectTo: "https://couto-hair-app.netlify.app/redefinir-senha",
    });

    if (error) {
      console.error("auth/request-password-reset Supabase rejected email", {
        code: error.code,
        status: error.status,
        message: error.message,
      });

      if (error.status === 429) {
        return json({
          error: "O envio de e-mails atingiu o limite temporário. Tente novamente mais tarde ou fale com o suporte.",
          retryAfterSeconds: 3600,
        }, 429);
      }

      if (error.code === "email_address_not_authorized") {
        return json({
          error: "O envio de e-mails ainda não está disponível para este endereço. Fale com o suporte.",
        }, 503);
      }

      return json({ error: "Não conseguimos enviar o link agora. Tente novamente mais tarde ou fale com o suporte." }, 503);
    }

    return json(genericResponse);
  } catch (error) {
    console.error("auth/request-password-reset unexpected error", error);
    return json({ error: "Não conseguimos concluir agora. Tente novamente mais tarde." }, 503);
  }
}
