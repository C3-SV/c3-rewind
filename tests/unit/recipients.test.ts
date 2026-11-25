import assert from "node:assert/strict";
import test from "node:test";
import { hashAccessToken } from "../../src/server/tokens.ts";
import { resolveRecipient, type AccessControlledRecord } from "../../src/server/recipient-resolution.ts";

const token = "d".repeat(43);
const record: AccessControlledRecord = {
  id: "example-partner",
  edition: 2026,
  status: "published",
  tokenHash: hashAccessToken(token),
  active: true,
};

test("only an active published hash resolves for the matching edition", () => {
  assert.equal(resolveRecipient([record], "2026", token)?.id, "example-partner");
  assert.equal(resolveRecipient([record], "2027", token), null);
  assert.equal(resolveRecipient([record], "2026", "bad-token"), null);
});

test("unknown and revoked recipients have the same null result", () => {
  const revoked = { ...record, active: false };

  assert.equal(resolveRecipient([revoked], "2026", token), null);
  assert.equal(resolveRecipient([], "2026", token), null);
});
