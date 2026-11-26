import { z } from "zod";

const ContributionSchema = z.enum(["financial", "venue", "prizes", "mentors", "judges", "other"]);
const PrivateImageFileSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*\.(?:avif|jpe?g|png|webp)$/i, "Use a local image filename, without a directory or public URL.");
export const RecipientSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  edition: z.number().int().min(2000).max(2100),
  commercialName: z.string().min(1),
  officialName: z.string().nullable(),
  logo: z.union([PrivateImageFileSchema, z.string().url().refine((value) => new URL(value).protocol === "https:")]).nullable(),
  status: z.enum(["draft", "review", "published"]),
  tokenHash: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  active: z.boolean(),
  welcomeMessage: z.string().nullable(),
  supportedEvents: z.array(z.string()),
  enabledByEvent: z.array(z.object({ eventId: z.string(), contribution: ContributionSchema, description: z.string().nullable() })),
  impact: z.array(z.object({ label: z.string(), value: z.string(), status: z.enum(["pending", "preliminary", "validated", "approved"]) })),
  media: z.array(z.object({ file: PrivateImageFileSchema, alt: z.string().trim().min(1), status: z.enum(["pending", "preliminary", "validated", "approved"]) })),
  people: z.array(z.object({ name: z.string(), role: z.string() })),
  testimonials: z.array(z.object({ text: z.string(), person: z.string(), permission: z.boolean() })),
  closingMessage: z.string().nullable(),
  contactDestination: z.string().nullable().refine((destination) => destination === null || /^(?:https:\/\/|mailto:)[^\s]+$/.test(destination), "Use HTTPS or mailto for contact links."),
  c3Owner: z.string().nullable(),
});

export const RecipientListSchema = z.array(RecipientSchema).superRefine((records, context) => {
  const identities = new Set<string>();
  const activeHashes = new Set<string>();
  records.forEach((record, index) => {
    const identity = `${record.edition}:${record.id}`;
    if (identities.has(identity)) context.addIssue({ code: "custom", path: [index, "id"], message: "Duplicate recipient ID in this edition." });
    identities.add(identity);
    if (!record.active || !record.tokenHash) return;
    const hash = `${record.edition}:${record.tokenHash}`;
    if (activeHashes.has(hash)) context.addIssue({ code: "custom", path: [index, "tokenHash"], message: "Recipients cannot share an active token hash in one edition." });
    activeHashes.add(hash);
  });
});
export type RecipientRecord = z.infer<typeof RecipientSchema>;
