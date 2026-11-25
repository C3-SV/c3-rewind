import assert from "node:assert/strict";
import test from "node:test";
import { resolveMediaSource } from "../../src/lib/media.ts";

test("local media remains local even when ImageKit is configured", () => {
  assert.equal(resolveMediaSource({ provider: "local", src: "/events/copa.webp" }, "https://ik.imagekit.io/c3"), "/events/copa.webp");
});

test("ImageKit media receives a public optimized URL", () => {
  const source = resolveMediaSource({ provider: "imagekit", src: "/rewind/copa.webp" }, "https://ik.imagekit.io/c3/");
  const url = new URL(source);
  assert.equal(url.origin, "https://ik.imagekit.io");
  assert.equal(url.pathname, "/c3/rewind/copa.webp");
  assert.equal(url.searchParams.get("tr"), "w-1600,q-85,f-auto");
});

test("ImageKit entries fall back to the configured local source until endpoint is supplied", () => {
  assert.equal(resolveMediaSource({ provider: "imagekit", src: "/events/copa.webp" }), "/events/copa.webp");
});
