// Dev helper: node scripts/shoot.mjs <outDir> <prefix> <width> <height> <slideId[,slideId...]> [waitsMs=600,2500,5500] [path=2026]
// Loads the live player fresh for each slide and captures at several timestamps. Dev server must run on :3000.
import { chromium } from "playwright";
const [, , out, prefix, w, h, ids, waitsArg = "600,2500,5500", path = "2026"] = process.argv;
const waits = waitsArg.split(",").map(Number);
const browser = await chromium.launch();
const mobile = Number(w) < 700;
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
for (const id of ids.split(",")) {
  await page.goto("about:blank");
  await page.goto(`http://127.0.0.1:3000/${path}#${id}`, { waitUntil: "networkidle", timeout: 120000 });
  let last = 0;
  for (const t of waits) {
    await page.waitForTimeout(t - last); last = t;
    await page.screenshot({ path: `${out}/${prefix}-${id}-${t}.png` });
  }
}
console.log("console/page errors:", JSON.stringify(errors.slice(0, 6)));
await browser.close();
