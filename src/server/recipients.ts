import "server-only";
import type { RecipientRecord } from "./recipient-schema.ts";
import { readRecipientRecords } from "./recipient-store.ts";
import { isRecipientPublishable, resolveRecipient } from "./recipient-resolution.ts";
import { getEdition, isEditionPublishable } from "../content/editions.ts";
export type { RecipientRecord } from "./recipient-schema.ts";

export function findRecipientById(id: string, edition: number): RecipientRecord | null {
  return readRecipientRecords().find((record) => record.id === id && record.edition === edition) ?? null;
}

export function getRecipientForRequest(edition: string, token: string): RecipientRecord | null {
  const recipient = resolveRecipient(readRecipientRecords(), edition, token);
  if (!recipient || process.env.NODE_ENV !== "production") return recipient;
  try {
    return isRecipientPublishable(recipient) && isEditionPublishable(getEdition(edition), "private") ? recipient : null;
  } catch {
    return null;
  }
}
