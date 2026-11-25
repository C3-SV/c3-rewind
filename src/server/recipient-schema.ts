import { z } from "zod";

const ContributionSchema = z.enum(["financial", "venue", "prizes", "mentors", "judges", "other"]);
export const RecipientSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  edition: z.number().int(),
  commercialName: z.string().min(1),
  officialName: z.string().nullable(),
  logo: z.string().nullable(),
  status: z.enum(["draft", "review", "published"]),
  tokenHash: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  active: z.boolean(),
  welcomeMessage: z.string().nullable(),
  supportedEvents: z.array(z.string()),
  enabledByEvent: z.array(z.object({ eventId: z.string(), contribution: ContributionSchema, description: z.string().nullable() })),
  impact: z.array(z.object({ label: z.string(), value: z.string(), status: z.enum(["pending", "preliminary", "validated", "approved"]) })),
  media: z.array(z.object({ file: z.string(), alt: z.string(), status: z.enum(["pending", "preliminary", "validated", "approved"]) })),
  people: z.array(z.object({ name: z.string(), role: z.string() })),
  testimonials: z.array(z.object({ text: z.string(), person: z.string(), permission: z.boolean() })),
  closingMessage: z.string().nullable(),
  contactDestination: z.string().nullable().refine((destination) => destination === null || /^(?:https:\/\/|mailto:)[^\s]+$/.test(destination), "Use HTTPS or mailto for contact links."),
  c3Owner: z.string().nullable(),
});

export const RecipientListSchema = z.array(RecipientSchema);
export type RecipientRecord = z.infer<typeof RecipientSchema>;
