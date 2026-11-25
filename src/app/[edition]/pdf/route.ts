import { getEdition, isEditionPublishable } from "../../../content/editions.ts";
import { contentVersion, privateNotFound, pdfResponse, readCurrentPdf } from "../../../server/pdf.ts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, context: { params: Promise<{ edition: string }> }) {
  const { edition: year } = await context.params;
  if (process.env.NODE_ENV === "production" && process.env.REWIND_GENERAL_PUBLISHED !== "true") return privateNotFound();
  try {
    const edition = getEdition(year);
    if (process.env.NODE_ENV === "production" && !isEditionPublishable(edition)) return privateNotFound();
    const bytes = await readCurrentPdf(`${year}-general`, contentVersion(edition));
    return bytes ? pdfResponse(bytes, year) : privateNotFound();
  } catch {
    return privateNotFound();
  }
}
