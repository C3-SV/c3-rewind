import assert from "node:assert/strict";
import test from "node:test";
import { EditionSchema } from "../../src/content/schema.ts";
import { getEdition, getGeneralExperienceMode, isEditionPublishable } from "../../src/content/editions.ts";

test("the unreviewed 2026 content is not considered publishable", () => {
  const edition = getEdition("2026");

  assert.equal(edition.publicationStatus, "draft");
  assert.equal(isEditionPublishable(edition), false);
});

test("production can show unapproved general content only in explicit review mode", () => {
  const edition = getEdition("2026");

  assert.equal(getGeneralExperienceMode(edition, { production: true, published: false, preview: true }), "review");
  assert.equal(getGeneralExperienceMode(edition, { production: true, published: false, preview: false }), "blocked");
  assert.equal(getGeneralExperienceMode(edition, { production: false, published: false, preview: false }), "review");
});

test("a photo gallery blocks publication until its assets are approved", () => {
  const edition = getEdition("2026");
  const approved = EditionSchema.parse({
    ...edition,
    publicationStatus: "approved",
    slides: edition.slides.map((slide, index) => ({
      ...slide,
      status: "approved",
      editorialNotes: [],
      blocks: index === 0 ? [{ type: "gallery", status: "approved", media: [{
        provider: "local", src: "/events/copa.webp", alt: "Competencia en laboratorio", status: "pending",
      }] }] : [],
    })),
  });

  assert.equal(isEditionPublishable(approved), false);
});

test("a missing slide ID is rejected by the editorial schema", () => {
  const edition = getEdition("2026");
  const invalid = { ...edition, slides: edition.slides.map(({ id: _id, ...slide }, i) => i === 0 ? slide : edition.slides[i]) };

  assert.throws(() => EditionSchema.parse(invalid));
});

test("duplicate stable slide IDs are rejected", () => {
  const edition = getEdition("2026");
  const duplicate = { ...edition, slides: edition.slides.map((slide, index) => index === 1 ? { ...slide, id: edition.slides[0]!.id } : slide) };

  assert.throws(() => EditionSchema.parse(duplicate));
});
