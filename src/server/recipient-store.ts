import { readFileSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import drafts from "./private/recipients.json" with { type: "json" };
import { RecipientListSchema } from "./recipient-schema.ts";

export function recipientFile(): string {
  const file = resolve(/* turbopackIgnore: true */ process.env.REWIND_RECIPIENTS_FILE || "src/server/private/recipients.json");
  const fromPublic = relative(resolve("public"), file);
  const outsidePublic = isAbsolute(fromPublic) || fromPublic === ".." || fromPublic.startsWith(`..${sep}`);
  if (!outsidePublic) throw new Error("Recipient configuration must stay outside public/.");
  return file;
}

export function readRecipientRecords() {
  return RecipientListSchema.parse(process.env.REWIND_RECIPIENTS_FILE ? JSON.parse(readFileSync(/* turbopackIgnore: true */ recipientFile(), "utf8")) : drafts);
}
