import { matchesAccessToken } from "./tokens.ts";
import type { RecipientRecord } from "./recipient-schema.ts";

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
  if (!/^\d{4}$/.test(edition) || !Number.isInteger(year) || token.length !== 43) return null;

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
  enabledByEvent: Array<{ eventId: string; description: string | null }>;
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
  enabledByEvent: Array<{ eventId: string; description: string | null }>;
  media: Array<{ status: string }>;
  welcomeMessage: string | null;
  closingMessage: string | null;
  contactDestination: string | null;
}>(record: T): boolean {
  return record.status === "published" && Boolean(record.logo?.trim()) &&
    record.supportedEvents.length > 0 && record.enabledByEvent.length > 0 &&
    record.supportedEvents.every((id) => id.trim() && record.enabledByEvent.some((event) => event.eventId === id)) &&
    record.enabledByEvent.every((event) => record.supportedEvents.includes(event.eventId) && Boolean(event.description?.trim())) &&
    record.media.some((asset) => asset.status === "approved") &&
    Boolean(record.welcomeMessage?.trim()) && Boolean(record.closingMessage?.trim()) && Boolean(record.contactDestination?.trim());
}

export function recipientPresentation(record: RecipientRecord) {
  return {
    id: record.id,
    commercialName: record.commercialName,
    logo: record.logo,
    welcomeMessage: record.welcomeMessage,
    closingMessage: record.closingMessage,
    contactDestination: record.contactDestination,
    supportedEvents: record.supportedEvents,
    enabledByEvent: record.enabledByEvent,
    impact: record.impact.filter((item) => item.status === "approved"),
    media: record.media.filter((item) => item.status === "approved"),
    people: record.people,
    testimonials: record.testimonials.filter((item) => item.permission),
  };
}
