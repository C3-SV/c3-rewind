import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getEdition, isEditionPublishable, resolveSlides } from "../src/content/editions.ts";
import { contentVersionFor } from "../src/lib/content-version.ts";
import { RecipientListSchema } from "../src/server/recipient-schema.ts";
import { isRecipientPublishable } from "../src/server/recipient-resolution.ts";

const args = process.argv.slice(2);
const mode = args.find((arg) => ["--general", "--recipient", "--all", "--edition"].includes(arg));
const editionIndex = args.indexOf("--edition");
const year = editionIndex >= 0 ? args[editionIndex + 1] : process.env.REWIND_LATEST_EDITION ?? "2026";
const recipientId = mode === "--recipient" ? args.find((arg, index) => !arg.startsWith("-") && index !== editionIndex + 1) : undefined;
const baseUrl = process.env.REWIND_PDF_BASE_URL ?? "http://localhost:3000";
const edition = getEdition(year);
const outputDirectory = resolve("private/pdfs");
const recipients = RecipientListSchema.parse(JSON.parse(await readFile(resolve("src/server/private/recipients.json"), "utf8")));
const readyRecipients = recipients.filter((recipient) => recipient.edition === edition.year && isRecipientPublishable(recipient));

if (!mode) throw new Error("Use --general, --recipient <id>, --all, or --edition <year>.");
if ((mode === "--general" || mode === "--edition") && !isEditionPublishable(edition)) throw new Error("General edition is not approved for publication.");

const targets = mode === "--general" || mode === "--edition"
  ? [{ id: "general", url: `${baseUrl}/dev/preview/${year}/general`, version: contentVersionFor(edition), count: resolveSlides(year, "general").length }]
  : mode === "--recipient"
    ? [(() => {
      if (!recipientId) throw new Error("Use --recipient <id>.");
      const recipient = readyRecipients.find((item) => item.id === recipientId);
      if (!recipient) throw new Error("Recipient is not publishable for this edition.");
      return { id: recipient.id, url: `${baseUrl}/dev/preview/${year}/${recipient.id}`, version: contentVersionFor(edition, recipient), count: resolveSlides(year, "private").length };
    })()]
    : readyRecipients.map((recipient) => ({ id: recipient.id, url: `${baseUrl}/dev/preview/${year}/${recipient.id}`, version: contentVersionFor(edition, recipient), count: resolveSlides(year, "private").length }));

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const target of targets) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
    await page.goto(target.url, { waitUntil: "domcontentloaded" });
    await page.emulateMedia({ media: "print" });
    await page.evaluate(() => document.fonts.ready);
    const renderedCount = await page.locator(".experience-slide").count();
    if (renderedCount !== target.count) throw new Error(`${target.id}: expected ${target.count} slides, rendered ${renderedCount}.`);
    const filename = `${edition.year}-${target.id}`;
    await page.pdf({ path: resolve(outputDirectory, `${filename}.pdf`), printBackground: true, preferCSSPageSize: true });
    await writeFile(resolve(outputDirectory, `${filename}.json`), `${JSON.stringify({ contentVersion: target.version, generatedAt: new Date().toISOString(), pages: target.count }, null, 2)}\n`, "utf8");
    await page.close();
    console.log(`Generated ${filename}.pdf (${target.count} pages).`);
  }
} finally {
  await browser.close();
}
