import { z } from "zod";
import { randomBytes } from "node:crypto";

export const RESERVED_CODES = new Set([
  "api",
  "links",
  "analytics",
  "dashboard",
  "settings",
  "docs",
  "qr",
  "deploy",
  "health",
  "robots.txt",
  "favicon.ico",
  "sitemap.xml",
  "404",
  "500",
  "admin",
  "login",
  "logout",
  "auth",
  "_next",
  "static",
  "public",
  "export"
]);

export function isReservedCode(code: string): boolean {
  return RESERVED_CODES.has(code.toLowerCase());
}

/**
 * Generate a cryptographically secure URL-friendly short code.
 * Uses an unambiguous alphabet (excluding 0, O, I, l).
 */
const ALPHABET = "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
export function generateShortCode(length: number = 6): string {
  const bytes = randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return result;
}

/**
 * Validates that destination URL uses only safe HTTP or HTTPS protocols
 * and does not point to a disallowed scheme.
 */
export function isSafeUrl(rawUrl: string, appHost?: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    // Disallow self-redirect loops if appHost is provided
    if (appHost && parsed.host.toLowerCase() === appHost.toLowerCase()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export const createLinkSchema = z
  .object({
    url: z.string().trim().url("Please enter a valid URL").max(2048, "URL cannot exceed 2048 characters"),
    alias: z
      .string()
      .trim()
      .min(3, "Custom alias must be at least 3 characters")
      .max(32, "Custom alias cannot exceed 32 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Alias may only contain letters, numbers, hyphens, and underscores")
      .optional()
      .or(z.literal("")),
    title: z.string().trim().max(120, "Title cannot exceed 120 characters").optional().or(z.literal("")),
    expiresAt: z.string().datetime().optional().or(z.literal("")).nullable(),
    isActive: z.boolean().optional().default(true)
  })
  .refine(
    (value) => isSafeUrl(value.url),
    { message: "Only HTTP and HTTPS destination URLs are allowed", path: ["url"] }
  )
  .refine(
    (value) => {
      if (!value.alias) return true;
      return !isReservedCode(value.alias);
    },
    { message: "This alias is reserved by the system. Please choose another.", path: ["alias"] }
  )
  .refine(
    (value) => {
      if (!value.expiresAt) return true;
      const expiry = new Date(value.expiresAt);
      return expiry.getTime() > Date.now();
    },
    { message: "Expiration date must be in the future", path: ["expiresAt"] }
  );

export const updateLinkSchema = z
  .object({
    destination: z.string().trim().url("Please enter a valid URL").max(2048).optional(),
    title: z.string().trim().max(120).optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable().or(z.literal("")),
    isActive: z.boolean().optional()
  })
  .refine(
    (value) => {
      if (!value.destination) return true;
      return isSafeUrl(value.destination);
    },
    { message: "Only HTTP and HTTPS destination URLs are allowed", path: ["destination"] }
  )
  .refine(
    (value) => {
      if (!value.expiresAt) return true;
      const expiry = new Date(value.expiresAt);
      return expiry.getTime() > Date.now();
    },
    { message: "Expiration date must be in the future", path: ["expiresAt"] }
  );
