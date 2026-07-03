import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/format/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), { status: 303 });
}

function redirectWithError(request: Request, error: string) {
  return redirectTo(request, `/login?erro=${error}`);
}

function mapAuthError(message?: string) {
  const normalizedMessage = (message || "").toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid credentials") ||
    normalizedMessage.includes("email not found") ||
    normalizedMessage.includes("user not found")
  ) {
    return "credenciais";
  }

  if (normalizedMessage.includes("email not confirmed") || normalizedMessage.includes("not confirmed")) {
    return "email-nao-confirmado";
  }

  return "login";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return redirectWithError(request, "dados");
  }

  const supabase = await createSupabaseServerClient();
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData.user) {
    console.error("Premium login auth failed:", {
      email,
      message: signInError?.message,
      status: signInError?.status,
    });
    return redirectWithError(request, mapAuthError(signInError?.message));
  }

  const user = signInData.user;
  const normalizedUserEmail = normalizeEmail(user.email || email);

  console.log("Premium login auth success:", {
    userId: user.id,
    email: normalizedUserEmail,
  });

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch (error) {
    console.error("Premium login admin client config error:", error);
    await supabase.auth.signOut();
    return redirectWithError(request, "validacao");
  }

  const { data: grant, error: grantError } = await admin
    .from("access_grants")
    .select("id,email,status,user_id")
    .ilike("email", normalizedUserEmail)
    .eq("status", "active")
    .maybeSingle();

  if (grantError) {
    console.error("Premium login access grant lookup failed:", {
      userId: user.id,
      email: normalizedUserEmail,
      code: grantError.code,
      message: grantError.message,
    });
    await supabase.auth.signOut();
    return redirectWithError(request, "validacao");
  }

  console.log("Premium login access grant lookup:", {
    userId: user.id,
    email: normalizedUserEmail,
    found: Boolean(grant),
    grantUserId: grant?.user_id || null,
  });

  if (!grant) {
    await supabase.auth.signOut();
    return redirectWithError(request, "sem-acesso");
  }

  if (grant.user_id && grant.user_id !== user.id) {
    await supabase.auth.signOut();
    return redirectWithError(request, "vinculado");
  }

  if (!grant.user_id) {
    const { error: updateError } = await admin
      .from("access_grants")
      .update({
        user_id: user.id,
        email: normalizedUserEmail,
        updated_at: new Date().toISOString(),
      })
      .eq("id", grant.id);

    if (updateError) {
      console.error("Premium login access grant update failed:", {
        userId: user.id,
        email: normalizedUserEmail,
        code: updateError.code,
        message: updateError.message,
      });
      await supabase.auth.signOut();
      return redirectWithError(request, "validacao");
    }

    console.log("Premium login access grant linked:", {
      userId: user.id,
      email: normalizedUserEmail,
    });
  }

  console.log("Premium login redirect final:", {
    userId: user.id,
    email: normalizedUserEmail,
    redirect: "/app",
  });

  return redirectTo(request, "/app");
}
