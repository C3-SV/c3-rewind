import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import recipients from "../../src/server/private/recipients.json" with { type: "json" };
import { hashAccessToken } from "../../src/server/tokens.ts";

test("protected media includes local logos, denies unlisted files, and shares the production publication gate", async () => {
  const directory = await mkdtemp(join(tmpdir(), "rewind-media-"));
  try {
    const file = join(directory, "recipients.json");
    const media = join(directory, "private", "media", "2026", "sample");
    await mkdir(media, { recursive: true });
    await writeFile(join(media, "logo.png"), "sample-logo");
    await writeFile(join(media, "photo.webp"), "sample-photo");
    await writeFile(file, JSON.stringify([{ ...recipients[0], id: "sample", commercialName: "Sample", status: "published", active: true,
      tokenHash: hashAccessToken("t".repeat(43)), logo: "logo.png", welcomeMessage: "Thanks", closingMessage: "Close", contactDestination: "https://example.com",
      supportedEvents: ["htc"], enabledByEvent: [{ eventId: "htc", contribution: "mentors", description: "Mentoring" }],
      media: [{ file: "photo.webp", alt: "Sample", status: "approved" }],
    }]));
    const moduleUrl = pathToFileURL(resolve("src/app/[edition]/p/[token]/media/[asset]/route.ts")).href;
    const code = `import assert from 'node:assert/strict'; import { GET } from ${JSON.stringify(moduleUrl)};
      const call = (asset, token = 't'.repeat(43)) => GET(new Request('http://localhost'), { params: Promise.resolve({ edition: '2026', token, asset }) });
      const logo = await call('logo.png'); assert.equal(logo.status, 200); assert.equal(await logo.text(), 'sample-logo');
      assert.match(logo.headers.get('cache-control'), /no-store/);
      assert.equal((await call('photo.webp')).status, 200);
      assert.equal((await call('unlisted.png')).status, 404);
      assert.equal((await call('../logo.png')).status, 404);
      assert.equal((await call('photo.webp', 'x'.repeat(43))).status, 404);
      process.env.NODE_ENV = 'production';
      assert.equal((await call('photo.webp')).status, 404, 'the unapproved edition blocks media as well as page and PDF');`;
    const result = spawnSync(process.execPath, ["--conditions=react-server", "--import", pathToFileURL(resolve("node_modules/tsx/dist/loader.mjs")).href, "--input-type=module", "-e", code], {
      cwd: directory, encoding: "utf8", env: { ...process.env, NODE_ENV: "development", REWIND_RECIPIENTS_FILE: file },
    });
    assert.equal(result.status, 0, result.stderr);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
