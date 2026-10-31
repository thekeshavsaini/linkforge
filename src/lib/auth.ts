import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";

export function getProvidedKey(request: NextRequest): string | null {
  // Check x-admin-key header
  const customHeader = request.headers.get("x-admin-key");
  if (customHeader) return customHeader.trim();

  // Check Authorization: Bearer <key>
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}

export function isAuthorized(request: NextRequest): boolean {
  const configured = process.env.ADMIN_API_KEY;
  const supplied = getProvidedKey(request);

  if (!configured || !supplied) return false;

  const a = Buffer.from(configured);
  const b = Buffer.from(supplied);

  return a.length === b.length && timingSafeEqual(a, b);
}
