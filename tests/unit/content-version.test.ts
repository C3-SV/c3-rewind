import assert from "node:assert/strict";
import test from "node:test";
import { getEdition } from "../../src/content/editions.ts";
import { contentVersionFor } from "../../src/lib/content-version.ts";

test("content version is stable and changes when publication content changes", () => {
  const edition = getEdition("2026");
  const initial = contentVersionFor(edition);

  assert.equal(contentVersionFor(edition), initial);
  assert.notEqual(contentVersionFor({ ...edition, title: `${edition.title} revised` }), initial);
});

test("recipient-specific changes produce a different PDF content version", () => {
  const edition = getEdition("2026");
  const recipient = { id: "test", welcomeMessage: "Gracias" };

  assert.notEqual(contentVersionFor(edition, recipient), contentVersionFor(edition, { ...recipient, welcomeMessage: "Otro mensaje" }));
});
