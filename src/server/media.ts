import "server-only";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import type { RecipientRecord } from "./recipient-schema.ts";
import { privateNotFound } from "./pdf.ts";

const imageTypes: Record<string, string> = { ".avif": "image/avif", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

export async function recipientMediaResponse(recipient: RecipientRecord | null, asset: string): Promise<Response> {
  const type = imageTypes[extname(asset).toLowerCase()];
  if (!recipient || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(asset) || !type) return privateNotFound();
  if (asset !== recipient.logo && !recipient.media.some((item) => item.file === asset && item.status === "approved")) return privateNotFound();
  try {
    const bytes = await readFile(join(process.cwd(), "private", "media", String(recipient.edition), recipient.id, asset));
    return new Response(new Uint8Array(bytes), { headers: {
      "Content-Type": type,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    } });
  } catch {
    return privateNotFound();
  }
}
