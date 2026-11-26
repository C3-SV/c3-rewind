import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import recipients from "../../src/server/private/recipients.json" with { type: "json" };

test("token commands accept a bare ID, create preserves an existing link, rotate replaces it, and revoke removes it", async () => {
  const directory = await mkdtemp(join(tmpdir(), "rewind-recipient-"));
  const file = join(directory, "recipients.json");
  try {
    await writeFile(file, JSON.stringify([{ ...recipients[0], id: "sample", commercialName: "Sample", status: "published",
      logo: "https://example.com/logo.png", welcomeMessage: "Sample thanks", closingMessage: "Sample close", contactDestination: "https://example.com",
      supportedEvents: ["htc"], enabledByEvent: [{ eventId: "htc", contribution: "mentors", description: "Sample mentoring" }],
      media: [{ file: "sample.webp", alt: "Sample evidence", status: "approved" }],
    }]));
    const run = (...args: string[]) => spawnSync(process.execPath, ["--import", "tsx", resolve("scripts/recipient-token.mjs"), ...args], {
      cwd: process.cwd(), encoding: "utf8", env: { ...process.env, REWIND_RECIPIENTS_FILE: file, REWIND_LATEST_EDITION: "2026" },
    });
    const record = async () => JSON.parse(await readFile(file, "utf8"))[0];
    assert.equal(run("create", "sample").status, 0, "create should accept the documented bare recipient ID");
    const initialHash = (await record()).tokenHash;
    assert.match(initialHash, /^[a-f0-9]{64}$/);
    assert.notEqual(run("create", "sample").status, 0);
    assert.equal((await record()).tokenHash, initialHash);
    assert.equal(run("rotate", "sample", "--edition", "2026").status, 0);
    assert.notEqual((await record()).tokenHash, initialHash);
    assert.equal(run("revoke", "--edition", "2026", "--recipient", "sample").status, 0);
    assert.equal((await record()).active, false);
    assert.equal((await record()).tokenHash, null);
    const pdf = spawnSync(process.execPath, ["--import", "tsx", resolve("scripts/generate-pdf.ts"), "--recipient", "sample", "--edition", "2026"], {
      cwd: process.cwd(), encoding: "utf8", env: { ...process.env, REWIND_RECIPIENTS_FILE: file },
    });
    assert.notEqual(pdf.status, 0);
    assert.match(pdf.stderr, /Edition is not approved for publication/, "private PDF generation must reject the unapproved edition before launching a browser");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
