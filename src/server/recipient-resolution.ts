import { matchesAccessToken } from "./tokens.ts";

export type AccessControlledRecord = {
  id: string;
  edition: number;
  status: "draft" | "review" | "published";
  active: boolean;
  tokenHash: string | null;
};

export function resolveRecipient<T extends AccessControlledRecord>(
  records: readonly T[],
  edition: string,
  token: string,
): T | null {
  const year = Number(edition);
  if (!Number.isInteger(year) || token.length !== 43) return null;

  for (const record of records) {
    if (record.edition !== year || record.status !== "published" || !record.active) continue;
    if (matchesAccessToken(token, record.tokenHash)) return record;
  }
  return null;
}

export function isRecipientPublishable<T extends {
  status: string;
  active: boolean;
  tokenHash: string | null;
  logo: string | null;
  supportedEvents: string[];
  enabledByEvent: Array<{ description: string | null }>;
  media: Array<{ status: string }>;
  welcomeMessage: string | null;
  closingMessage: string | null;
  contactDestination: string | null;
}>(record: T): boolean {
  return isRecipientContentApproved(record) && record.active && record.tokenHash !== null;
}

export function isRecipientContentApproved<T extends {
  status: string;
  logo: string | null;
  supportedEvents: string[];
  enabledByEvent: Array<{ description: string | null }>;
  media: Array<{ status: string }>;
  welcomeMessage: string | null;
  closingMessage: string | null;
  contactDestination: string | null;
}>(record: T): boolean {
  return record.status === "published" && record.logo !== null &&
    record.supportedEvents.length > 0 && record.enabledByEvent.length > 0 &&
    record.enabledByEvent.every((event) => event.description !== null) &&
    record.media.some((asset) => asset.status === "approved") &&
    record.welcomeMessage !== null && record.closingMessage !== null && record.contactDestination !== null;
}
