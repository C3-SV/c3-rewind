import { getEdition } from "../../../../../content/editions.ts";
import { getRecipientForRequest } from "../../../../../server/recipients.ts";
import { contentVersion, privateNotFound, pdfResponse, readCurrentPdf } from "../../../../../server/pdf.ts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, context: { params: Promise<{ edition: string; token: string }> }) {
  const { edition: year, token } = await context.params;
  const recipient = getRecipientForRequest(year, token);
  if (!recipient) return privateNotFound();
  try {
    const edition = getEdition(year);
    const bytes = await readCurrentPdf(`${year}-${recipient.id}`, contentVersion(edition, recipient));
    return bytes ? pdfResponse(bytes, year) : privateNotFound();
  } catch {
    return privateNotFound();
  }
}
