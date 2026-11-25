import "server-only";
import recipientsJson from "./private/recipients.json" with { type: "json" };
import { RecipientListSchema, type RecipientRecord } from "./recipient-schema.ts";
import { isRecipientPublishable, resolveRecipient } from "./recipient-resolution.ts";
export { isRecipientPublishable, resolveRecipient } from "./recipient-resolution.ts";
export type { RecipientRecord } from "./recipient-schema.ts";
const recipientRecords: RecipientRecord[] = RecipientListSchema.parse(recipientsJson);

export function findRecipientById(id: string, edition: number): RecipientRecord | null {
  return recipientRecords.find((record) => record.id === id && record.edition === edition) ?? null;
}

export function listApprovedRecipients(edition: number): RecipientRecord[] {
  return recipientRecords.filter((record) => record.edition === edition && record.status === "published" && record.active && record.tokenHash);
}

export function getRecipientForRequest(edition: string, token: string): RecipientRecord | null {
  return resolveRecipient(recipientRecords, edition, token);
}
