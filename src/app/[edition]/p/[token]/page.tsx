import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RewindPlayer } from "../../../../components/rewind/rewind-player.tsx";
import { getEdition, presentationContent } from "../../../../content/editions.ts";
import { getRecipientForRequest } from "../../../../server/recipients.ts";
import { recipientPresentation } from "../../../../server/recipient-resolution.ts";
import { env } from "../../../../server/env.ts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { edition: string; token: string };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "C3 Rewind",
    description: "Un año de competencia, creación y conexión.",
    robots: { index: false, follow: false, noarchive: true },
    openGraph: { title: "C3 Rewind", description: "Un año de competencia, creación y conexión.", type: "website" },
  };
}

export default async function PrivateEditionPage({ params }: { params: Promise<Params> }) {
  const { edition: year, token } = await params;
  const recipient = getRecipientForRequest(year, token);
  if (!recipient) notFound();
  let edition;
  try { edition = getEdition(year); } catch { notFound(); }
  const content = presentationContent(edition, "private");

  return (
    <RewindPlayer
      slides={content.slides}
      edition={year}
      photos={content.photos}
      imageKitEndpoint={env.IMAGEKIT_URL_ENDPOINT || undefined}
      recipient={recipientPresentation(recipient)}
      pdfHref={`/${year}/p/${token}/pdf`}
    />
  );
}
