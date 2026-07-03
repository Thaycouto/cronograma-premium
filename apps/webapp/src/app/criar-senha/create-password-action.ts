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

  const supabase = createSupabaseAdminClient();
  const { data: grant, error: grantError } = await supabase
    .from("access_grants")
    .select("id,status,user_id")
    .eq("email", email)
    .eq("status", "active")
    .maybeSingle();

  if (grantError || !grant) {
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
    redirect("/criar-senha?erro=conta");
  }

  await supabase
    .from("access_grants")
    .update({
      user_id: data.user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", grant.id);

  redirect("/login?senha=criada");
}
