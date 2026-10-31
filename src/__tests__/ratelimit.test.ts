import test from "node:test";
import assert from "node:assert";
import { checkRateLimit } from "../lib/ratelimit.js";

test("checkRateLimit - Allows requests within limit", () => {
  const id = `test-user-${Date.now()}`;
  const r1 = checkRateLimit(id, 5, 10);
  assert.strictEqual(r1.success, true);
  assert.strictEqual(r1.remaining, 4);

  const r2 = checkRateLimit(id, 5, 10);
  assert.strictEqual(r2.success, true);
  assert.strictEqual(r2.remaining, 3);
});

test("checkRateLimit - Enforces limit threshold", () => {
  const id = `test-threshold-${Date.now()}`;
  for (let i = 0; i < 3; i++) {
    const res = checkRateLimit(id, 3, 10);
    assert.strictEqual(res.success, true);
  }

  // 4th request should fail
  const blocked = checkRateLimit(id, 3, 10);
  assert.strictEqual(blocked.success, false);
  assert.strictEqual(blocked.remaining, 0);
  assert.ok(blocked.resetSeconds > 0);
});
