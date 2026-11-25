import assert from "node:assert/strict";
import test from "node:test";
import { resolveSlides } from "../../src/content/editions.ts";

test("general edition has thirteen enabled slides and never includes Tu huella", () => {
  const slides = resolveSlides("2026", "general");

  assert.equal(slides.length, 13);
  assert.deepEqual(slides.map((slide) => slide.id), [
    "portada",
    "gracias",
    "etapa",
    "cifras",
    "copa-col",
    "copa-uni",
    "htc-1",
    "htc-2",
    "conecta",
    "somos36",
    "voces",
    "dos7",
    "cierre",
  ]);
});

test("private edition inserts its stable Tu huella slide before the team chapter", () => {
  const slides = resolveSlides("2026", "private");

  assert.equal(slides.length, 14);
  assert.equal(slides[9]?.id, "huella");
  assert.equal(slides[9]?.status, "pending");
});

test("disabled slides are omitted without renumbering their stable IDs", () => {
  const slides = resolveSlides("2026", "general", { disabled: ["cifras"] });

  assert.equal(slides.length, 12);
  assert.equal(slides.some((slide) => slide.id === "cifras"), false);
  assert.equal(slides.find((slide) => slide.id === "copa-col")?.id, "copa-col");
});
