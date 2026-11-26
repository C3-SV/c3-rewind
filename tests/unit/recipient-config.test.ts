import assert from "node:assert/strict";
import test from "node:test";
import { RecipientListSchema, RecipientSchema } from "../../src/server/recipient-schema.ts";
import { recipientFile } from "../../src/server/recipient-store.ts";
import recipients from "../../src/server/private/recipients.json" with { type: "json" };

const draft = { ...recipients[0], id: "sample", commercialName: "Sample" };

test("recipient configuration rejects duplicate identities and shared active hashes", () => {
  assert.throws(() => RecipientListSchema.parse([draft, draft]));
  assert.throws(() => RecipientListSchema.parse([
    { ...draft, tokenHash: "a".repeat(64), active: true },
    { ...draft, id: "second", tokenHash: "a".repeat(64), active: true },
  ]));
});

test("recipient evidence must use a protected local filename", () => {
  for (const file of ["../secret.png", "https://example.com/private.png", "nested/photo.png", ".", ""]) {
    assert.throws(() => RecipientSchema.parse({ ...draft, media: [{ file, alt: "Sample", status: "approved" }] }));
  }
  assert.doesNotThrow(() => RecipientSchema.parse({ ...draft, media: [{ file: "event-01.webp", alt: "Sample", status: "approved" }] }));
  for (const logo of ["../logo.png", "/brand/logo.png", "http://example.com/logo.png", "https://"]) {
    assert.throws(() => RecipientSchema.parse({ ...draft, logo }));
  }
});

test("private configuration rejects every path within public, including a filename beginning with two dots", () => {
  const original = process.env.REWIND_RECIPIENTS_FILE;
  try {
    for (const file of ["public/recipients.json", "public/..secret.json"]) {
      process.env.REWIND_RECIPIENTS_FILE = file;
      assert.throws(() => recipientFile());
    }
    process.env.REWIND_RECIPIENTS_FILE = "src/server/private/recipients.local.json";
    assert.doesNotThrow(() => recipientFile());
  } finally {
    if (original === undefined) delete process.env.REWIND_RECIPIENTS_FILE;
    else process.env.REWIND_RECIPIENTS_FILE = original;
  }
});
