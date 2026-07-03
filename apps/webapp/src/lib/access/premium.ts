import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeEmail } from "@/lib/format/email";

export async function userHasPremiumAccess(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email ? normalizeEmail(userData.user.email) : undefined;

  const byUserId = await supabase
    .from("access_grants")
    .select("status,user_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (byUserId.data?.status === "active") {
    return true;
  }

  if (!email) {
    return false;
  }

  const byEmail = await supabase
    .from("access_grants")
    .select("status,user_id")
    .eq("email", email)
    .eq("status", "active")
    .maybeSingle();

  return byEmail.data?.status === "active" && (!byEmail.data.user_id || byEmail.data.user_id === userId);
}
