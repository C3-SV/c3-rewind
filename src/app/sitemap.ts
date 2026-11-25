import type { MetadataRoute } from "next";
import { env } from "../server/env.ts";

export default function sitemap(): MetadataRoute.Sitemap {
  if (env.REWIND_INDEX_GENERAL !== "true" || env.REWIND_GENERAL_PUBLISHED !== "true") return [];
  return [{ url: `${env.REWIND_SITE_ORIGIN}/${env.REWIND_LATEST_EDITION}`, changeFrequency: "yearly", priority: 1 }];
}
