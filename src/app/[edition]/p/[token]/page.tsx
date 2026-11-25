import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RewindPlayer } from "../../../../components/rewind/rewind-player.tsx";
import { getEdition, isEditionPublishable, resolveSlides } from "../../../../content/editions.ts";
import { getRecipientForRequest } from "../../../../server/recipients.ts";
import { isRecipientPublishable } from "../../../../server/recipient-resolution.ts";
import { env } from "../../../../server/env.ts";
import type { RecipientPresentation } from "../../../../components/slides/slide-view.tsx";

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
  if (process.env.NODE_ENV === "production" && !isRecipientPublishable(recipient)) notFound();
  if (process.env.NODE_ENV === "production" && !isEditionPublishable(edition)) notFound();

  const presentation: RecipientPresentation = {
    id: recipient.id,
    commercialName: recipient.commercialName,
    logo: recipient.logo,
    welcomeMessage: recipient.welcomeMessage,
    closingMessage: recipient.closingMessage,
    contactDestination: recipient.contactDestination,
    supportedEvents: recipient.supportedEvents,
    enabledByEvent: recipient.enabledByEvent,
    impact: recipient.impact,
    media: recipient.media,
    people: recipient.people,
    testimonials: recipient.testimonials,
  };

  return (
    <RewindPlayer
      slides={resolveSlides(year, "private")}
      edition={year}
      imageKitEndpoint={env.IMAGEKIT_URL_ENDPOINT || undefined}
      recipient={presentation}
      pdfHref={`/${year}/p/${token}/pdf`}
    />
  );
}
