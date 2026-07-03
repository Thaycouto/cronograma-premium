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
  return redirectTo(request, `/criar-senha?erro=${error}`);
}

function isExistingUserError(errorMessage?: string) {
  if (!errorMessage) {
    return false;
  }

  const normalizedMessage = errorMessage.toLowerCase();
  return (
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already exists") ||
    normalizedMessage.includes("user already")
  );
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");

  if (!email || password.length < 8) {
    return redirectWithError(request, "dados");
  }

  let admin: ReturnType<typeof createSupabaseAdminClient>;
  try {
    admin = createSupabaseAdminClient();
  } catch (error) {
    console.error("Create password admin client config error:", error);
    return redirectWithError(request, "conta");
  }

  const { data: grant, error: grantError } = await admin
    .from("access_grants")
    .select("id,email,status,user_id")
    .ilike("email", email)
    .eq("status", "active")
    .maybeSingle();

  if (grantError) {
    console.error("Create password access grant lookup failed:", {
      code: grantError.code,
      message: grantError.message,
    });
    return redirectWithError(request, "conta");
  }

  if (!grant) {
    return redirectWithError(request, "sem-acesso");
  }

  if (grant.user_id) {
    return redirectWithError(request, "conta-existente");
  }

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      source: "kiwify",
      premium_access: true,
    },
  });

  if (createUserError || !createdUser.user) {
    console.error("Create password Supabase auth user creation failed:", {
      message: createUserError?.message,
      status: createUserError?.status,
    });

    if (isExistingUserError(createUserError?.message)) {
      return redirectWithError(request, "conta-existente");
    }

    return redirectWithError(request, "conta");
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
    console.error("Create password access grant update failed:", {
      code: updateError.code,
      message: updateError.message,
    });
    return redirectWithError(request, "conta");
  }

  const supabase = await createSupabaseServerClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error("Create password sign-in after account creation failed:", {
      message: signInError.message,
      status: signInError.status,
    });
    return redirectTo(request, "/login?senha=criada");
  }

  return redirectTo(request, "/dashboard");
}
