import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardApp } from "@/app/dashboard/dashboard-app";
import { getPremiumSession, premiumSessionCookieName } from "@/lib/premium-session";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const hasPremiumCookie = Boolean(cookieStore.get(premiumSessionCookieName)?.value);
  const session = await getPremiumSession();

  console.log("/dashboard carregou", {
    hasPremiumCookie,
    premiumSessionValid: Boolean(session),
    email: session?.email || null,
  });

  if (!session) {
    console.log("/dashboard redirect decidido", {
      redirectTo: "/api/auth/logout?next=/login",
      reason: hasPremiumCookie ? "invalid_chp_session" : "missing_chp_session",
    });
    redirect("/api/auth/logout?next=/login");
  }

  return <DashboardApp email={session.email} />;
}
