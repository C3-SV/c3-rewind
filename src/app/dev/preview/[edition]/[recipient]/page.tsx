import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaticDeck } from "../../../../../components/rewind/static-deck.tsx";
import type { RecipientPresentation } from "../../../../../components/slides/slide-view.tsx";
import { getEdition, resolveSlides } from "../../../../../content/editions.ts";
import { findRecipientById } from "../../../../../server/recipients.ts";
import { env } from "../../../../../server/env.ts";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { robots: { index: false, follow: false, noarchive: true }, title: "Vista previa C3 Rewind" };

export default async function DevelopmentPreview({ params }: { params: Promise<{ edition: string; recipient: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { edition: year, recipient: id } = await params;
  let edition;
  try { edition = getEdition(year); } catch { notFound(); }
  const company = id === "general" ? null : findRecipientById(id, Number(year));
  if (id !== "general" && !company) notFound();

  const companyForView: RecipientPresentation | undefined = company ? {
    id: company.id,
    commercialName: company.commercialName,
    logo: company.logo,
    welcomeMessage: company.welcomeMessage,
    closingMessage: company.closingMessage,
    contactDestination: company.contactDestination,
    supportedEvents: company.supportedEvents,
    enabledByEvent: company.enabledByEvent,
    impact: company.impact,
    media: company.media,
    people: company.people,
    testimonials: company.testimonials,
  } : undefined;

  return (
    <StaticDeck
      slides={resolveSlides(year, company ? "private" : "general")}
      edition={year}
      imageKitEndpoint={env.IMAGEKIT_URL_ENDPOINT || undefined}
      recipient={companyForView}
      isDevelopment
      pdfHref={`/dev/preview/${year}/${id}/pdf`}
    />
  );
}
