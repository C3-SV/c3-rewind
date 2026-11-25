import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RewindPlayer } from "../../components/rewind/rewind-player.tsx";
import { getEdition, isEditionPublishable, resolveSlides } from "../../content/editions.ts";
import { env } from "../../server/env.ts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { edition: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { edition: year } = await params;
  return {
    title: "C3 Rewind",
    description: "Un año de competencia, creación y conexión.",
    robots: {
      index: process.env.REWIND_INDEX_GENERAL === "true" && process.env.REWIND_GENERAL_PUBLISHED === "true" && year === (process.env.REWIND_LATEST_EDITION ?? "2026"),
      follow: process.env.REWIND_INDEX_GENERAL === "true" && process.env.REWIND_GENERAL_PUBLISHED === "true" && year === (process.env.REWIND_LATEST_EDITION ?? "2026"),
      noarchive: true,
    },
    openGraph: { title: "C3 Rewind", description: "Un año de competencia, creación y conexión.", type: "website" },
  };
}

export default async function EditionPage({ params }: { params: Promise<Params> }) {
  const { edition: year } = await params;
  let edition;
  try { edition = getEdition(year); } catch { notFound(); }

  if (process.env.NODE_ENV === "production" && (
    process.env.REWIND_GENERAL_PUBLISHED !== "true" || !isEditionPublishable(edition)
  )) notFound();

  return <RewindPlayer slides={resolveSlides(year, "general")} edition={year} imageKitEndpoint={env.IMAGEKIT_URL_ENDPOINT || undefined} isDevelopment={process.env.NODE_ENV !== "production"} />;
}
