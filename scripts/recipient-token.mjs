import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createAccessToken, hashAccessToken } from "../src/server/tokens.ts";
import { isRecipientContentApproved } from "../src/server/recipient-resolution.ts";

const file = resolve("src/server/private/recipients.json");
const [operation, ...arguments_] = process.argv.slice(2);
if (arguments_.includes("--help") || !operation) {
  console.log("Usage: npm run token:create -- <recipient-id> [--edition 2026]\n       npm run token:rotate -- <recipient-id> [--edition 2026]\n       npm run token:revoke -- <recipient-id> [--edition 2026]");
  process.exit(0);
}
const editionPosition = arguments_.indexOf("--edition");
const edition = Number(editionPosition >= 0 ? arguments_[editionPosition + 1] : process.env.REWIND_LATEST_EDITION ?? "2026");
const id = arguments_.find((argument, index) => argument !== "--edition" && index !== editionPosition + 1 && !argument.startsWith("-"));

if (!["create", "rotate", "revoke"].includes(operation) || !id || !Number.isInteger(edition)) {
  console.error("Usage: npm run token:create -- <recipient-id> | npm run token:rotate -- <recipient-id> | npm run token:revoke -- <recipient-id>");
  process.exit(2);
}

const recipients = JSON.parse(await readFile(file, "utf8"));
const recipient = recipients.find((item) => item.id === id && item.edition === edition);
if (!recipient) throw new Error("Recipient not found for this edition.");

if (operation === "revoke") {
  recipient.active = false;
  recipient.tokenHash = null;
  await writeFile(file, `${JSON.stringify(recipients, null, 2)}\n`, "utf8");
  console.log(`Revoked the active link for ${id}.`);
} else {
  if (!isRecipientContentApproved(recipient)) throw new Error("Complete and approve the recipient content before issuing an access link.");
  const token = createAccessToken();
  recipient.tokenHash = hashAccessToken(token);
  recipient.active = true;
  await writeFile(file, `${JSON.stringify(recipients, null, 2)}\n`, "utf8");
  const origin = process.env.REWIND_SITE_ORIGIN ?? "http://localhost:3000";
  console.log(`New private link (save it now; the raw token is not stored):\n${origin}/${edition}/p/${token}`);
}
