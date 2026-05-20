import {
  authenticateUser,
  createToken,
  decodePayload,
  getBearerToken,
  verifyToken,
} from "@/modules/auth/service";

export const AUTH_COOKIE_NAME = "auth_token";

export function createAuthToken(username: string, ttlSeconds = 60 * 60 * 8) {
  return createToken(username, ttlSeconds);
}

export function verifyAuthToken(token: string) {
  return verifyToken(token);
}

export function getBearerTokenFromHeader(authorizationHeader: string | null) {
  return getBearerToken(authorizationHeader);
}

export function decodeTokenPayload(token: string) {
  return decodePayload(token);
}

export async function authenticateFromDb(username: string, password: string) {
  return authenticateUser(username, password);
}
