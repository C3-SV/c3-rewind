import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaticDeck } from "../../../../../components/rewind/static-deck.tsx";
import { getEdition, isEditionPublishable, presentationContent } from "../../../../../content/editions.ts";
import { findRecipientById } from "../../../../../server/recipients.ts";
import { isRecipientContentApproved, recipientPresentation } from "../../../../../server/recipient-resolution.ts";
import { env } from "../../../../../server/env.ts";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { robots: { index: false, follow: false, noarchive: true }, title: "Vista previa C3 Rewind" };

export default async function DevelopmentPreview({ params, searchParams }: { params: Promise<{ edition: string; recipient: string }>; searchParams: Promise<{ export?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { edition: year, recipient: id } = await params;
  let edition;
  try { edition = getEdition(year); } catch { notFound(); }
  const company = id === "general" ? null : findRecipientById(id, Number(year));
  if (id !== "general" && !company) notFound();

  const exportMode = (await searchParams).export === "1";
  const view = company ? "private" : "general";
  if (exportMode && (!isEditionPublishable(edition, view) || (company && !isRecipientContentApproved(company)))) notFound();
  const content = presentationContent(edition, view, !exportMode);

  return (
    <StaticDeck
      slides={content.slides}
      edition={year}
      photos={content.photos}
      imageKitEndpoint={env.IMAGEKIT_URL_ENDPOINT || undefined}
      recipient={company ? recipientPresentation(company) : undefined}
      isDevelopment={!exportMode}
      pdfHref={`/dev/preview/${year}/${id}/pdf`}
    />
  );
}
