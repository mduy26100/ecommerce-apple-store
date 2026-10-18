import { JWT_CLAIMS } from "../constants/role.constants";
import type { UserDetails } from "@features/auth/types/auth.types";

export interface DecodedToken {
  sub: string;
  role: string;
  tenant_id?: string;
  exp?: number;
  iss?: string;
  aud?: string;
  [key: string]: any;
}

/**
 * Safely decodes a Base64URL encoded string.
 * Handles missing padding and Unicode characters.
 */
function safeBase64UrlDecode(str: string): string | null {
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    const rawBinary = window.atob(base64);
    const bytes = new Uint8Array(rawBinary.length);
    for (let i = 0; i < rawBinary.length; i++) {
      bytes[i] = rawBinary.charCodeAt(i);
    }

    return new TextDecoder("utf-8").decode(bytes);
  } catch (error) {
    console.error("Base64 URL decoding failed:", error);
    return null;
  }
}

/**
 * Decodes the payload portion of a JWT token safely.
 */
export function decodeJwt<T = any>(token: string): T | null {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const decodedPayload = safeBase64UrlDecode(parts[1]);
    if (!decodedPayload) return null;

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Failed to parse JWT payload JSON:", error);
    return null;
  }
}

/**
 * Extracts and maps JWT token claims to UserDetails structure.
 * Normalizes missing/undefined values (e.g. tenantId) to null.
 */
export function getUserDetailsFromToken(token: string): UserDetails | null {
  const decoded = decodeJwt<DecodedToken>(token);
  if (!decoded) return null;

  return {
    id: decoded[JWT_CLAIMS.SUB] || "",
    role: decoded[JWT_CLAIMS.ROLE] || "",
    tenantId: decoded[JWT_CLAIMS.TENANT_ID] || null, // Normalize to null if not present
  };
}
