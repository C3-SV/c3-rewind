import { getRecipientForRequest } from "../../../../../../server/recipients.ts";
import { recipientMediaResponse } from "../../../../../../server/media.ts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: Request, context: { params: Promise<{ edition: string; token: string; asset: string }> }) {
  const { edition, token, asset } = await context.params;
  return recipientMediaResponse(getRecipientForRequest(edition, token), asset);
}
