import assert from "node:assert/strict";
import test from "node:test";
import { EditionSchema } from "../../src/content/schema.ts";
import { getEdition, getGeneralExperienceMode, isEditionPublishable, presentationContent } from "../../src/content/editions.ts";

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
      facts: [],
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

function approvedEdition() {
  const edition = getEdition("2026");
  return EditionSchema.parse({ ...edition, publicationStatus: "approved", photos: {}, slides: edition.slides.map((slide) => ({
    ...slide, status: "approved", facts: [], blocks: [], editorialNotes: [],
  })) });
}

test("publication checks facts and the private slide; optional draft photo slots are filtered", () => {
  const edition = approvedEdition();
  assert.equal(isEditionPublishable(edition), true);
  edition.slides[0]!.facts.push({ icon: "users", text: "Unverified figure", status: "pending" });
  assert.equal(isEditionPublishable(edition), false);
  edition.slides[0]!.facts = [];
  edition.photos.reel1 = { provider: "local", src: "/draft.webp", alt: "Draft", private: false, status: "pending" };
  assert.equal(isEditionPublishable(edition), true);
  assert.equal("reel1" in presentationContent(edition, "general").photos, false);
  edition.photos = {};
  edition.slides.find((slide) => slide.id === "huella")!.status = "pending";
  assert.equal(isEditionPublishable(edition), true);
  assert.equal(isEditionPublishable(edition, "private"), false);
});

test("public payloads exclude private assets even during review, and final payloads exclude drafts", () => {
  const edition = approvedEdition();
  const privateAsset = { provider: "local" as const, src: "/secret.webp", alt: "Private", private: true, status: "approved" as const };
  edition.photos.secret = privateAsset;
  edition.photos.draft = { ...privateAsset, private: false, src: "/draft.webp", status: "pending" };
  edition.slides[0]!.editorialNotes = ["Internal note"];
  edition.slides[0]!.facts = [{ icon: "users", text: "Internal figure", status: "pending" }];
  edition.slides[0]!.blocks = [{ type: "image", media: privateAsset }, { type: "copy", text: "Internal copy", status: "pending" }];
  const final = JSON.stringify(presentationContent(edition, "general"));
  for (const secret of ["secret.webp", "draft.webp", "Internal note", "Internal figure", "Internal copy"]) assert.equal(final.includes(secret), false);
  assert.equal(JSON.stringify(presentationContent(edition, "general", true)).includes("secret.webp"), false);
  assert.equal(presentationContent(edition, "general").slides.some((slide) => slide.id === "huella"), false);
});
