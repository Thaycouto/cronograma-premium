import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/format/email";

export async function userHasPremiumAccess(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email ? normalizeEmail(userData.user.email) : undefined;

  if (!email) {
    return false;
  }

  const { data: grants, error } = await supabase
    .from("access_grants")
    .select("email,status,user_id")
    .ilike("email", email)
    .limit(5);

  if (error || !grants?.length) {
    return false;
  }

  return grants.some((grant) => {
    const grantEmail = normalizeEmail(String(grant.email || ""));
    const grantStatus = String(grant.status || "").trim().toLowerCase();
    const grantUserId = grant.user_id ? String(grant.user_id).trim() : null;

    return grantEmail === email && grantStatus === "active" && (!grantUserId || grantUserId === userId);
  });
}
