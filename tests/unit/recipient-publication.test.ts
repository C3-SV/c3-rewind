import assert from "node:assert/strict";
import test from "node:test";
import { isRecipientContentApproved, isRecipientPublishable } from "../../src/server/recipient-resolution.ts";
import type { RecipientRecord } from "../../src/server/recipients.ts";

const approvedRecipient: RecipientRecord = {
  id: "sample", edition: 2026, commercialName: "Sample", officialName: null, logo: "sample-logo.png",
  status: "published", tokenHash: "a".repeat(64), active: true,
  welcomeMessage: "Gracias por acompañar a C3.", supportedEvents: ["htc"],
  enabledByEvent: [{ eventId: "htc", contribution: "mentors", description: "Mentoría para equipos." }],
  impact: [], media: [{ file: "htc-01.webp", alt: "Equipo trabajando", status: "approved" }],
  people: [], testimonials: [], closingMessage: "Sigamos construyendo.", contactDestination: "https://example.com/contact", c3Owner: "C3 owner",
};

test("private content needs approved event evidence and a contact destination before publication", () => {
  assert.equal(isRecipientPublishable({ ...approvedRecipient, media: [] }), false);
  assert.equal(isRecipientPublishable({ ...approvedRecipient, contactDestination: null }), false);
  assert.equal(isRecipientPublishable(approvedRecipient), true);
});

test("a new access link can only be issued after the private story is editorially approved", () => {
  assert.equal(isRecipientContentApproved({ ...approvedRecipient, tokenHash: null, active: false }), true);
  assert.equal(isRecipientContentApproved({ ...approvedRecipient, logo: null }), false);
  assert.equal(isRecipientContentApproved({ ...approvedRecipient, media: [{ file: "draft.webp", alt: "Pendiente", status: "pending" }] }), false);
});
