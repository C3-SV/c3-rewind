import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Edition } from "../content/schema.ts";
import { contentVersionFor } from "../lib/content-version.ts";
import type { RecipientRecord } from "./recipients.ts";

export { contentVersionFor as contentVersion } from "../lib/content-version.ts";

export function currentContentVersion(edition: Edition, recipient?: RecipientRecord): string { return contentVersionFor(edition, recipient); }

export async function readCurrentPdf(
  fileBase: string,
  currentVersion: string,
): Promise<Buffer | null> {
  const directory = join(process.cwd(), "private", "pdfs");
  try {
    const metadata = JSON.parse(await readFile(join(directory, `${fileBase}.json`), "utf8")) as { contentVersion?: string };
    if (metadata.contentVersion !== currentVersion) return null;
    return await readFile(join(directory, `${fileBase}.pdf`));
  } catch {
    return null;
  }
}

export function pdfResponse(bytes: Buffer, year: string): Response {
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="C3-Rewind-${year}.pdf"`,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Referrer-Policy": "no-referrer",
    },
  });
}

export function privateNotFound(): Response {
  return new Response("Not found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Referrer-Policy": "no-referrer",
    },
  });
}
