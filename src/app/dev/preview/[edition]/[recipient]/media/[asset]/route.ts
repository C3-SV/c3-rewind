import { findRecipientById } from "../../../../../../../server/recipients.ts";
import { privateNotFound } from "../../../../../../../server/pdf.ts";
import { recipientMediaResponse } from "../../../../../../../server/media.ts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, context: { params: Promise<{ edition: string; recipient: string; asset: string }> }) {
  if (process.env.NODE_ENV === "production") return privateNotFound();
  const { edition, recipient: id, asset } = await context.params;
  return recipientMediaResponse(findRecipientById(id, Number(edition)), asset);
}
