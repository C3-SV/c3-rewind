import { rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import nextEnv from "@next/env";
import { createAccessToken, hashAccessToken } from "../src/server/tokens.ts";
import { isRecipientContentApproved } from "../src/server/recipient-resolution.ts";
import { readRecipientRecords, recipientFile } from "../src/server/recipient-store.ts";

nextEnv.loadEnvConfig(process.cwd(), true);
const [operation, ...arguments_] = process.argv.slice(2);
if (arguments_.includes("--help") || !operation) {
  console.log("Usage: npm run token:create -- <recipient-id> [--edition 2026]\n       npm run token:rotate -- <recipient-id> [--edition 2026]\n       npm run token:revoke -- <recipient-id> [--edition 2026]");
  process.exit(0);
}
const editionPosition = arguments_.indexOf("--edition");
const edition = Number(editionPosition >= 0 ? arguments_[editionPosition + 1] : process.env.REWIND_LATEST_EDITION ?? "2026");
const recipientPosition = arguments_.indexOf("--recipient");
const id = recipientPosition >= 0 ? arguments_[recipientPosition + 1] : arguments_.find((argument, index) => (editionPosition < 0 || index !== editionPosition + 1) && !argument.startsWith("-"));

if (!["create", "rotate", "revoke"].includes(operation) || !id || !Number.isInteger(edition)) {
  console.error("Usage: npm run token:create -- <recipient-id> | npm run token:rotate -- <recipient-id> | npm run token:revoke -- <recipient-id>");
  process.exit(2);
}

const file = recipientFile();
if (!process.env.REWIND_RECIPIENTS_FILE || file === resolve("src/server/private/recipients.json")) throw new Error("Set REWIND_RECIPIENTS_FILE to a private, untracked configuration before changing credentials.");
const recipients = readRecipientRecords();
const recipient = recipients.find((item) => item.id === id && item.edition === edition);
if (!recipient) throw new Error("Recipient not found for this edition.");

if (operation === "revoke") {
  recipient.active = false;
  recipient.tokenHash = null;
  await save();
  console.log(`Revoked the active link for ${id}.`);
} else {
  if (operation === "create" && recipient.tokenHash) throw new Error("A link already exists. Use token:rotate to replace it.");
  if (!isRecipientContentApproved(recipient)) throw new Error("Complete and approve the recipient content before issuing an access link.");
  const token = createAccessToken();
  recipient.tokenHash = hashAccessToken(token);
  recipient.active = true;
  await save();
  const origin = process.env.REWIND_SITE_ORIGIN ?? "http://localhost:3000";
  console.log(`New private link (save it now; the raw token is not stored):\n${origin}/${edition}/p/${token}`);
}

async function save() {
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(recipients, null, 2)}\n`, { encoding: "utf8", flag: "wx", mode: 0o600 });
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}
