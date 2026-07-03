import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const premiumSessionCookieName = "chp_session";

type PremiumSessionPayload = {
  user_id: string;
  email: string;
  iat: number;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("Missing premium session signing secret");
  }

  return secret;
}

function toBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createPremiumSessionToken(userId: string, email: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: PremiumSessionPayload = {
    user_id: userId,
    email,
    iat: issuedAt,
    exp: issuedAt + 60 * 60 * 24 * 7,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyPremiumSessionToken(token?: string) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as PremiumSessionPayload;

    if (!payload.user_id || !payload.email || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getPremiumSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(premiumSessionCookieName)?.value;

  return verifyPremiumSessionToken(token);
}

export function getPremiumSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}
