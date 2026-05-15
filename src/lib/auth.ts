import { createHmac, timingSafeEqual } from "node:crypto";

type JwtPayload = {
  sub: string;
  iat: number;
  exp: number;
};

const encoder = new TextEncoder();

export const AUTH_COOKIE_NAME = "auth_token";

function base64UrlEncode(value: string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function sign(input: string, secret: string): string {
  return createHmac("sha256", encoder.encode(secret))
    .update(input)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) {
    throw new Error("AUTH_JWT_SECRET is not set");
  }
  return secret;
}

export function createAuthToken(username: string, ttlSeconds = 60 * 60 * 8): string {
  const secret = getAuthSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: username,
    iat: now,
    exp: now + ttlSeconds,
  };

  const headerSegment = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadSegment = base64UrlEncode(JSON.stringify(payload));
  const unsigned = `${headerSegment}.${payloadSegment}`;
  const signature = sign(unsigned, secret);

  return `${unsigned}.${signature}`;
}

export function verifyAuthToken(token: string): JwtPayload | null {
  try {
    const secret = getAuthSecret();
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerSegment, payloadSegment, signatureSegment] = parts;
    const unsigned = `${headerSegment}.${payloadSegment}`;
    const expectedSignature = sign(unsigned, secret);

    const expectedBuffer = Buffer.from(expectedSignature);
    const providedBuffer = Buffer.from(signatureSegment);
    if (expectedBuffer.length !== providedBuffer.length) return null;
    if (!timingSafeEqual(expectedBuffer, providedBuffer)) return null;

    const header = JSON.parse(base64UrlDecode(headerSegment)) as { alg?: string; typ?: string };
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;

    const payload = JSON.parse(base64UrlDecode(payloadSegment)) as JwtPayload;
    if (!payload?.sub || !payload?.exp || !payload?.iat) return null;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return null;

    return payload;
  } catch {
    return null;
  }
}

export function getBearerTokenFromHeader(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token.trim();
}

export function decodeTokenPayload(token: string): Record<string, unknown> | null {
  const payload = verifyAuthToken(token);
  if (!payload) return null;
  return {
    sub: payload.sub,
    iat: payload.iat,
    exp: payload.exp,
  };
}
