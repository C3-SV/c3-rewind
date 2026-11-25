import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { getRecipientForRequest } from "../../../../../../server/recipients.ts";
import { privateNotFound } from "../../../../../../server/pdf.ts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const imageTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_request: Request, context: { params: Promise<{ edition: string; token: string; asset: string }> }) {
  const { edition, token, asset } = await context.params;
  const recipient = getRecipientForRequest(edition, token);
  if (!recipient || !/^[A-Za-z0-9._-]+$/.test(asset)) return privateNotFound();
  const entry = recipient.media.find((item) => item.file === asset && item.status === "approved");
  const type = imageTypes[extname(asset).toLowerCase()];
  if (!entry || !type) return privateNotFound();

  try {
    const bytes = await readFile(join(process.cwd(), "private", "media", String(recipient.edition), recipient.id, asset));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(bytes.byteLength),
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch {
    return privateNotFound();
  }
}
