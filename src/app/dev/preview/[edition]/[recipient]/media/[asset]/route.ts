import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { findRecipientById } from "../../../../../../../server/recipients.ts";
import { privateNotFound } from "../../../../../../../server/pdf.ts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const imageTypes: Record<string, string> = { ".avif": "image/avif", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

export async function GET(_request: Request, context: { params: Promise<{ edition: string; recipient: string; asset: string }> }) {
  if (process.env.NODE_ENV === "production") return privateNotFound();
  const { edition, recipient: id, asset } = await context.params;
  if (!/^[A-Za-z0-9._-]+$/.test(asset)) return privateNotFound();
  const recipient = findRecipientById(id, Number(edition));
  const entry = recipient?.media.find((item) => item.file === asset && item.status === "approved");
  const type = imageTypes[extname(asset).toLowerCase()];
  if (!recipient || !entry || !type) return privateNotFound();
  try {
    const bytes = await readFile(join(process.cwd(), "private", "media", edition, recipient.id, asset));
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": type, "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" } });
  } catch {
    return privateNotFound();
  }
}
