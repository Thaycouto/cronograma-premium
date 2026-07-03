"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/format/email";

export async function createPassword(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");

  if (!email || password.length < 8) {
    redirect("/criar-senha?erro=dados");
  }

  let supabase: ReturnType<typeof createSupabaseAdminClient>;
  try {
    supabase = createSupabaseAdminClient();
  } catch (error) {
    console.error("Create password Supabase admin config error:", error);
    redirect("/criar-senha?erro=config");
  }

  const { data: grant, error: grantError } = await supabase
    .from("access_grants")
    .select("id,status,user_id,email")
    .ilike("email", email)
    .eq("status", "active")
    .maybeSingle();

  if (grantError) {
    console.error("Create password access grant lookup failed:", {
      code: grantError.code,
      message: grantError.message,
    });
    redirect("/criar-senha?erro=config");
  }

  if (!grant) {
    redirect("/criar-senha?erro=sem-acesso");
  }

  if (grant.user_id) {
    redirect("/login?conta=existente");
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      source: "kiwify",
      premium_access: true,
    },
  });

  if (error || !data.user) {
    console.error("Create password Supabase auth user creation failed:", {
      message: error?.message,
      status: error?.status,
    });
    redirect("/criar-senha?erro=conta");
  }

  const { error: updateError } = await supabase
    .from("access_grants")
    .update({
      user_id: data.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", grant.id);

  if (updateError) {
    console.error("Create password access grant update failed:", {
      code: updateError.code,
      message: updateError.message,
    });
    redirect("/criar-senha?erro=config");
  }

  redirect("/login?senha=criada");
}
