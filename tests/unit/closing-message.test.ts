import assert from "node:assert/strict";
import test from "node:test";
import { splitClosingMessage } from "../../src/lib/closing-message.ts";

test("approved closing text is preserved with or without final punctuation", () => {
  assert.deepEqual(splitClosingMessage("Gracias por acompañarnos. Sigamos creando juntos"), { body: "Gracias por acompañarnos. Sigamos creando juntos", sign: "Nos vemos en 2027." });
  assert.deepEqual(splitClosingMessage("Gracias. Nos vemos pronto"), { body: "Gracias.", sign: "Nos vemos pronto" });
  assert.deepEqual(splitClosingMessage("Gracias. Nos vemos en 2027."), { body: "Gracias.", sign: "Nos vemos en 2027." });
});