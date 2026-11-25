import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getEdition, isEditionPublishable } from "../src/content/editions.ts";
import { RecipientListSchema } from "../src/server/recipient-schema.ts";
import { isRecipientPublishable } from "../src/server/recipient-resolution.ts";

const args = process.argv.slice(2);
const editionIndex = args.indexOf("--edition");
const editionYear = editionIndex >= 0 ? args[editionIndex + 1] : process.env.REWIND_LATEST_EDITION ?? "2026";
const publishMode = args.includes("--publish");
const recipientIndex = args.indexOf("--recipient");
const recipientId = recipientIndex >= 0 ? args[recipientIndex + 1] : null;
const edition = getEdition(editionYear);
const privateFile = resolve("src/server/private/recipients.json");
const recipients = RecipientListSchema.parse(JSON.parse(await readFile(privateFile, "utf8")));
let failed = false;

console.log(`C3 Rewind ${edition.year} · ${edition.publicationStatus}`);
for (const slide of edition.slides) {
  const unresolved: string[] = [];
  if (!slide.enabled) continue;
  if (slide.status !== "approved") unresolved.push(`slide ${slide.id}: ${slide.status}`);
  for (const block of slide.blocks) {
    if (block.type === "image") {
      if (block.media.status !== "approved") unresolved.push(`slide ${slide.id}: image ${block.media.status}`);
    } else if (block.type === "gallery") {
      if (block.status !== "approved") unresolved.push(`slide ${slide.id}: gallery ${block.status}`);
      block.media.forEach((asset) => {
        if (asset.status !== "approved") unresolved.push(`slide ${slide.id}: gallery asset ${asset.src} ${asset.status}`);
      });
    } else if (block.status !== "approved") {
      unresolved.push(`slide ${slide.id}: ${block.type} ${block.status}`);
    }
  }
  for (const note of slide.editorialNotes) unresolved.push(`slide ${slide.id}: ${note}`);
  for (const line of unresolved) console.log(`- ${line}`);
}

if (recipientId) {
  const recipient = recipients.find((item) => item.id === recipientId && item.edition === edition.year);
  if (!recipient) throw new Error(`No recipient record for ${recipientId} in ${edition.year}.`);
  if (!isRecipientPublishable(recipient)) {
    console.log(`- recipient ${recipient.id}: missing approved private content or active token`);
    failed = true;
  } else {
    console.log(`Recipient ${recipient.id}: ready for private publication.`);
  }
}

if (publishMode && !isEditionPublishable(edition)) {
  console.error("General edition is blocked: all required slides and blocks must be approved, with exactly 13 general slides.");
  failed = true;
}

if (failed) process.exitCode = 1;
else console.log(publishMode ? "Publication requirements satisfied." : "Editorial draft validated; use --publish to enforce release requirements.");
