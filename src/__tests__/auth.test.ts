import test from "node:test";
import assert from "node:assert";
import { isAuthorized, getProvidedKey } from "../lib/auth.js";
import { NextRequest } from "next/server";

test("getProvidedKey - Extraction from headers", () => {
  // Test x-admin-key header
  const req1 = new NextRequest("http://localhost:3000/api/links", {
    headers: { "x-admin-key": "secret-123" }
  });
  assert.strictEqual(getProvidedKey(req1), "secret-123");

  // Test Authorization: Bearer <key>
  const req2 = new NextRequest("http://localhost:3000/api/links", {
    headers: { authorization: "Bearer bearer-secret-456" }
  });
  assert.strictEqual(getProvidedKey(req2), "bearer-secret-456");

  // Test missing header
  const req3 = new NextRequest("http://localhost:3000/api/links");
  assert.strictEqual(getProvidedKey(req3), null);
});

test("isAuthorized - Validation against ADMIN_API_KEY", () => {
  const originalKey = process.env.ADMIN_API_KEY;
  process.env.ADMIN_API_KEY = "test-strong-production-key";

  try {
    // Valid x-admin-key
    const reqValid = new NextRequest("http://localhost:3000/api/links", {
      headers: { "x-admin-key": "test-strong-production-key" }
    });
    assert.strictEqual(isAuthorized(reqValid), true);

    // Valid Bearer key
    const reqBearer = new NextRequest("http://localhost:3000/api/links", {
      headers: { authorization: "Bearer test-strong-production-key" }
    });
    assert.strictEqual(isAuthorized(reqBearer), true);

    // Invalid key
    const reqInvalid = new NextRequest("http://localhost:3000/api/links", {
      headers: { "x-admin-key": "wrong-key" }
    });
    assert.strictEqual(isAuthorized(reqInvalid), false);

    // Missing key
    const reqMissing = new NextRequest("http://localhost:3000/api/links");
    assert.strictEqual(isAuthorized(reqMissing), false);
  } finally {
    process.env.ADMIN_API_KEY = originalKey;
  }
});
