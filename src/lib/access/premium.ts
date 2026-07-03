import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function userHasPremiumAccess(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const email = userData.user?.email;

  const byUserId = await supabase
    .from("premium_access")
    .select("active")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (byUserId.data?.active) {
    return true;
  }

  if (!email) {
    return false;
  }

  const byEmail = await supabase
    .from("premium_access")
    .select("active")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();

  return Boolean(byEmail.data?.active);
}
