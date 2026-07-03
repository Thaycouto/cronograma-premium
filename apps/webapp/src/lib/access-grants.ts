import { normalizeEmail } from "@/lib/format/email";

export type AccessGrant = {
  id: string;
  email: string | null;
  status: string | null;
  user_id: string | null;
};

export type NormalizedAccessGrant = AccessGrant & {
  normalizedEmail: string;
  normalizedStatus: string;
  normalizedUserId: string | null;
};

export function normalizeGrant(grant: AccessGrant): NormalizedAccessGrant {
  return {
    ...grant,
    normalizedEmail: normalizeEmail(String(grant.email || "")),
    normalizedStatus: String(grant.status || "").trim().toLowerCase(),
    normalizedUserId: grant.user_id ? String(grant.user_id).trim() : null,
  };
}

export async function findActiveAccessGrant(admin: { from: (table: "access_grants") => any }, email: string) {
  const normalizedEmail = normalizeEmail(email);
  const { data, error } = await admin
    .from("access_grants")
    .select("id,email,status,user_id")
    .ilike("email", normalizedEmail)
    .limit(10);

  if (error) {
    return { grant: null, grants: [], error };
  }

  const grants = ((data || []) as AccessGrant[]).map(normalizeGrant);
  const grant = grants.find(
    (item) => item.normalizedEmail === normalizedEmail && item.normalizedStatus === "active",
  );

  return { grant: grant || null, grants, error: null };
}
