import test from "node:test";
import assert from "node:assert";
import { parseDevice } from "../lib/device.js";

test("parseDevice - Bots", () => {
  assert.strictEqual(
    parseDevice("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"),
    "bot"
  );
  assert.strictEqual(
    parseDevice("Twitterbot/1.0"),
    "bot"
  );
  assert.strictEqual(
    parseDevice("facebookexternalhit/1.1"),
    "bot"
  );
});

test("parseDevice - Tablets", () => {
  assert.strictEqual(
    parseDevice("Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15"),
    "tablet"
  );
});

test("parseDevice - Mobile", () => {
  assert.strictEqual(
    parseDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"),
    "mobile"
  );
  assert.strictEqual(
    parseDevice("Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 Mobile Safari/537.36"),
    "mobile"
  );
});

test("parseDevice - Desktop", () => {
  assert.strictEqual(
    parseDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"),
    "desktop"
  );
  assert.strictEqual(
    parseDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"),
    "desktop"
  );
  assert.strictEqual(
    parseDevice("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/118.0.0.0 Safari/537.36"),
    "desktop"
  );
});

test("parseDevice - Fallbacks", () => {
  assert.strictEqual(parseDevice(""), "other");
  assert.strictEqual(parseDevice(null), "other");
  assert.strictEqual(parseDevice(undefined), "other");
  assert.strictEqual(parseDevice("CustomUnknownAgent/1.0"), "other");
});
