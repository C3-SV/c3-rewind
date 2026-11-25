import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RewindPlayer } from "../../components/rewind/rewind-player.tsx";
import { getEdition, getGeneralExperienceMode, isEditionPublishable, resolveSlides } from "../../content/editions.ts";
import { env } from "../../server/env.ts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { edition: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { edition: year } = await params;
  let publishable = false;
  try { publishable = isEditionPublishable(getEdition(year)); } catch {}
  const indexable = env.REWIND_GENERAL_PREVIEW === "false" &&
    env.REWIND_INDEX_GENERAL === "true" && env.REWIND_GENERAL_PUBLISHED === "true" &&
    publishable && year === env.REWIND_LATEST_EDITION;
  return {
    title: "C3 Rewind",
    description: "Un año de competencia, creación y conexión.",
    robots: {
      index: indexable,
      follow: indexable,
      noarchive: true,
    },
    openGraph: { title: "C3 Rewind", description: "Un año de competencia, creación y conexión.", type: "website" },
  };
}

export default async function EditionPage({ params }: { params: Promise<Params> }) {
  const { edition: year } = await params;
  let edition;
  try { edition = getEdition(year); } catch { notFound(); }

  const mode = getGeneralExperienceMode(edition, {
    production: process.env.NODE_ENV === "production",
    published: env.REWIND_GENERAL_PUBLISHED === "true",
    preview: env.REWIND_GENERAL_PREVIEW === "true" && year === env.REWIND_LATEST_EDITION,
  });
  if (mode === "blocked") notFound();

  return <RewindPlayer slides={resolveSlides(year, "general")} photos={edition.photos} edition={year} imageKitEndpoint={env.IMAGEKIT_URL_ENDPOINT || undefined} isDevelopment={process.env.NODE_ENV !== "production"} isReviewPreview={mode === "review" && process.env.NODE_ENV === "production"} />;
}
