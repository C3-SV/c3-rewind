import { z } from "zod";

export const EditorialStatusSchema = z.enum([
  "pending",
  "preliminary",
  "validated",
  "approved",
]);

export const SlideIdSchema = z.enum([
  "portada",
  "gracias",
  "etapa",
  "cifras",
  "copa-col",
  "copa-uni",
  "htc-1",
  "htc-2",
  "conecta",
  "huella",
  "somos36",
  "voces",
  "dos7",
  "cierre",
]);

const MediaSchema = z.object({
  provider: z.enum(["local", "imagekit"]).default("local"),
  src: z.string().min(1),
  alt: z.string(),
  status: EditorialStatusSchema,
  focalPoint: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }).optional(),
  private: z.boolean().default(false),
});

const BlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("copy"), text: z.string(), status: EditorialStatusSchema.default("approved") }),
  z.object({
    type: z.literal("stat"),
    value: z.string(),
    label: z.string(),
    context: z.string(),
    status: EditorialStatusSchema,
    source: z.string().optional(),
  }),
  z.object({ type: z.literal("image"), media: MediaSchema }),
  z.object({ type: z.literal("gallery"), media: z.array(MediaSchema).min(1), status: EditorialStatusSchema }),
  z.object({
    type: z.literal("quote"),
    text: z.string(),
    person: z.string(),
    role: z.string().optional(),
    status: EditorialStatusSchema,
  }),
  z.object({ type: z.literal("initiative"), title: z.string(), body: z.string(), status: EditorialStatusSchema }),
]);

const FactSchema = z.object({
  icon: z.enum(["cal", "pin", "clock", "users", "team", "school", "flag", "trophy"]),
  text: z.string(),
  status: EditorialStatusSchema,
});

export const SlideSchema = z.object({
  id: SlideIdSchema,
  chapter: z.enum(["apertura", "compite", "crea", "conecta", "equipo", "futuro", "cierre"]),
  chapterLabel: z.string(),
  title: z.string(),
  layout: z.enum(["cover", "thanks", "axes", "impact", "event", "build", "connect", "imprint", "team", "voices", "future", "close"]),
  audience: z.enum(["both", "general", "private"]),
  status: EditorialStatusSchema,
  enabled: z.boolean().default(true),
  background: z.enum(["navy", "compite", "crea", "conecta", "copa", "htc"]).default("navy"),
  body: z.string().optional(),
  blocks: z.array(BlockSchema).default([]),
  facts: z.array(FactSchema).default([]),
  editorialNotes: z.array(z.string()).default([]),
});

export const EditionSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  title: z.string(),
  publicationStatus: z.enum(["draft", "review", "approved"]),
  /** Optional named photo slots (e.g. "reel1", "copa2", "grupo"). Scenes render a designed frame until a slot is filled. */
  photos: z.record(z.string(), MediaSchema).default({}),
  slides: z.array(SlideSchema).min(1),
}).superRefine((edition, context) => {
  const seen = new Set<string>();
  edition.slides.forEach((slide, index) => {
    if (seen.has(slide.id)) {
      context.addIssue({ code: "custom", path: ["slides", index, "id"], message: `Duplicate stable slide ID: ${slide.id}` });
    }
    seen.add(slide.id);
  });
});

export type EditorialStatus = z.infer<typeof EditorialStatusSchema>;
export type SlideId = z.infer<typeof SlideIdSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type Edition = z.infer<typeof EditionSchema>;
export type Fact = z.infer<typeof FactSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type ContentBlock = z.infer<typeof BlockSchema>;
