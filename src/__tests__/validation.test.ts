import test from "node:test";
import assert from "node:assert";
import {
  isSafeUrl,
  isReservedCode,
  generateShortCode,
  createLinkSchema,
  updateLinkSchema
} from "../lib/validation.js";

test("URL Validation - Safe Protocols", () => {
  assert.strictEqual(isSafeUrl("https://example.com"), true);
  assert.strictEqual(isSafeUrl("http://example.org/path?query=1#hash"), true);
  assert.strictEqual(isSafeUrl("javascript:alert(1)"), false);
  assert.strictEqual(isSafeUrl("data:text/html;base64,PHNjcmlwdD4="), false);
  assert.strictEqual(isSafeUrl("file:///etc/passwd"), false);
  assert.strictEqual(isSafeUrl("vbscript:msgbox(1)"), false);
  assert.strictEqual(isSafeUrl("not-a-url"), false);
});

test("URL Validation - Self Redirect Loop Guard", () => {
  assert.strictEqual(isSafeUrl("https://linkforge.app/abc", "linkforge.app"), false);
  assert.strictEqual(isSafeUrl("https://other.com/abc", "linkforge.app"), true);
});

test("Short Code Generator", () => {
  const code1 = generateShortCode(6);
  const code2 = generateShortCode(6);

  assert.strictEqual(code1.length, 6);
  assert.strictEqual(code2.length, 6);
  assert.notStrictEqual(code1, code2);
  // Ensure valid URL characters
  assert.match(code1, /^[a-zA-Z0-9]+$/);
});

test("Reserved Codes Protection", () => {
  assert.strictEqual(isReservedCode("api"), true);
  assert.strictEqual(isReservedCode("API"), true);
  assert.strictEqual(isReservedCode("settings"), true);
  assert.strictEqual(isReservedCode("health"), true);
  assert.strictEqual(isReservedCode("analytics"), true);
  assert.strictEqual(isReservedCode("custom-campaign"), false);
  assert.strictEqual(isReservedCode("my-link-123"), false);
});

test("createLinkSchema Validation", () => {
  // Valid input
  const valid = createLinkSchema.safeParse({
    url: "https://example.com/blog",
    alias: "my-blog",
    title: "My Blog"
  });
  assert.strictEqual(valid.success, true);

  // Reserved alias should fail
  const reserved = createLinkSchema.safeParse({
    url: "https://example.com",
    alias: "api"
  });
  assert.strictEqual(reserved.success, false);

  // Unsafe URL should fail
  const unsafe = createLinkSchema.safeParse({
    url: "javascript:void(0)"
  });
  assert.strictEqual(unsafe.success, false);

  // Expiration in past should fail
  const past = new Date(Date.now() - 100000).toISOString();
  const pastExpiry = createLinkSchema.safeParse({
    url: "https://example.com",
    expiresAt: past
  });
  assert.strictEqual(pastExpiry.success, false);

  // Expiration in future should succeed
  const future = new Date(Date.now() + 1000000).toISOString();
  const futureExpiry = createLinkSchema.safeParse({
    url: "https://example.com",
    expiresAt: future
  });
  assert.strictEqual(futureExpiry.success, true);
});

test("updateLinkSchema Validation", () => {
  const validUpdate = updateLinkSchema.safeParse({
    destination: "https://newdestination.com",
    title: "New Title",
    isActive: false
  });
  assert.strictEqual(validUpdate.success, true);

  const invalidUrl = updateLinkSchema.safeParse({
    destination: "ftp://disallowed-protocol.com"
  });
  assert.strictEqual(invalidUrl.success, false);
});
