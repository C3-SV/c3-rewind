import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const allowGeneral = process.env.REWIND_GENERAL_PREVIEW === "false" && process.env.REWIND_INDEX_GENERAL === "true" && process.env.REWIND_GENERAL_PUBLISHED === "true";
  const latestEdition = process.env.REWIND_LATEST_EDITION ?? "2026";
  return {
    rules: [{
      userAgent: "*",
      allow: allowGeneral ? "/" : undefined,
      disallow: allowGeneral ? ["/dev/", "/20*/p/"] : "/",
    }],
  };
}
