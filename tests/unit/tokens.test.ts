import assert from "node:assert/strict";
import test from "node:test";
import { createAccessToken, hashAccessToken, matchesAccessToken } from "../../src/server/tokens.ts";

test("new access tokens contain 256 bits of cryptographic randomness", () => {
  const first = createAccessToken();
  const second = createAccessToken();

  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first, second);
});

test("access-token storage contains a one-way SHA-256 digest rather than the token", () => {
  const token = "a".repeat(43);
  const digest = hashAccessToken(token);

  assert.match(digest, /^[a-f0-9]{64}$/);
  assert.notEqual(digest, token);
  assert.equal(matchesAccessToken(token, digest), true);
});

test("malformed and wrong access tokens never match a stored digest", () => {
  const digest = hashAccessToken("b".repeat(43));

  assert.equal(matchesAccessToken("not-a-token", digest), false);
  assert.equal(matchesAccessToken("c".repeat(43), digest), false);
  assert.equal(matchesAccessToken("b".repeat(43), "invalid-hash"), false);
});
