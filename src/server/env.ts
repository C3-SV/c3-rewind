import "server-only";
import { z } from "zod";

const EnvironmentSchema = z.object({
  REWIND_LATEST_EDITION: z.string().regex(/^20\d{2}$/).default("2026"),
  REWIND_GENERAL_PUBLISHED: z.enum(["true", "false"]).default("false"),
  REWIND_GENERAL_PREVIEW: z.enum(["true", "false"]).default("true"),
  REWIND_INDEX_GENERAL: z.enum(["true", "false"]).default("false"),
  REWIND_SITE_ORIGIN: z.string().url().default("https://rewind.c3.com.sv"),
  IMAGEKIT_URL_ENDPOINT: z.union([z.literal(""), z.string().url()]).default(""),
});

export const env = EnvironmentSchema.parse(process.env);
