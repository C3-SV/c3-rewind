import { expect, test } from "@playwright/test";

test("general experience prepares adjacent slides and keeps keyboard/chapter navigation", async ({ page }) => {
  await page.goto("/2026");
  await expect(page.locator(".story-scene")).toHaveCount(2);
  await expect(page.locator(".nav-count")).toHaveText("01 / 13");

  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".nav-count")).toHaveText("02 / 13");
  await expect(page).toHaveURL(/#gracias$/);

  await page.getByRole("button", { name: "Ir al capítulo Conecta" }).click();
  await expect(page.locator(".experience-slide.is-active [data-slide-id]")).toHaveAttribute("data-slide-id", "conecta");
  await page.keyboard.press("Home");
  await expect(page.locator(".nav-count")).toHaveText("01 / 13");
  await page.keyboard.press("End");
  await expect(page.locator(".nav-count")).toHaveText("13 / 13");
});

test("hidden cover navigation is excluded from focus and malformed fragments do not break navigation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/2026#%E0%A4%A");
  await expect(page.locator(".rw-hud")).toHaveAttribute("inert", "");
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#gracias$/);
  expect(errors).toEqual([]);
});

test("global pause is available on mobile and resolves motion during navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/2026");
  await page.getByRole("button", { name: "Pausar animaciones", exact: true }).click();
  await page.keyboard.press("End");
  await expect(page.locator(".experience-slide.is-active [data-slide-id]")).toHaveAttribute("data-slide-id", "cierre");
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length)).toBe(0);
  await expect(page.locator(".experience-slide.is-active h1")).toBeVisible();
});

test("reduced motion restores a deep link without running animations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/2026#somos36");
  await expect(page.locator(".experience-slide.is-active [data-slide-id]")).toHaveAttribute("data-slide-id", "somos36");
  await expect(page.locator(".sm-n")).toHaveText("36");
  expect(await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length)).toBe(0);
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".story-scene")).toHaveCount(3);
});

test("rapid navigation settles on the requested slide without stale transitions", async ({ page }) => {
  await page.goto("/2026");
  for (let index = 0; index < 12; index += 1) await page.keyboard.press("ArrowRight");
  await expect(page.locator(".nav-count")).toHaveText("13 / 13");
  await page.keyboard.press("ArrowLeft");
  await expect(page.locator(".nav-count")).toHaveText("12 / 13");
  await expect(page.locator(".experience-slide.is-active [data-slide-id]")).toHaveAttribute("data-slide-id", "dos7");
});

test("unapproved general page does not expose partner names or a production selector", async ({ page, request }) => {
  const response = await page.goto("/2026");
  expect(response?.headers()["x-robots-tag"]).toContain("noindex");
  const html = await response!.text();
  for (const name of ["Applaudo", "TechyWe", "RSM", "Ravn", "Crecer"]) expect(html).not.toContain(name);
  await expect(page.locator(".dev-ribbon")).toBeVisible();
  await expect(page.locator("select, [data-recipient-selector]")).toHaveCount(0);
});

test("private pages and PDFs return the same non-cacheable, non-indexed not-found response for an invalid token", async ({ request }) => {
  const token = "x".repeat(43);
  for (const path of [`/2026/p/${token}`, `/2026/p/${token}/pdf`]) {
    const response = await request.get(path);
    expect(response.status()).toBe(404);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
    expect(response.headers()["referrer-policy"]).toBe("no-referrer");
    expect(await response.text()).not.toContain("Applaudo");
  }
});

test("general static rendering exports thirteen 16:9 PDF pages", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/dev/preview/2026/general");
  await page.emulateMedia({ media: "print" });
  const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true });
  const pageObjects = new TextDecoder().decode(pdf).match(/\/Type\s*\/Page\b/g) ?? [];
  expect(pageObjects).toHaveLength(13);
});

test("private static rendering includes its exclusive fourteenth slide", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/dev/preview/2026/applaudo");
  await expect(page.locator(".story-scene")).toHaveCount(14);
  await page.emulateMedia({ media: "print" });
  const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true });
  const pageObjects = new TextDecoder().decode(pdf).match(/\/Type\s*\/Page\b/g) ?? [];
  expect(pageObjects).toHaveLength(14);
});

test("mobile layout fits the viewport and supports horizontal touch navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/2026");
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, body: document.body.scrollWidth }));
  expect(widths.body).toBeLessThanOrEqual(widths.viewport);

  const stage = page.locator(".experience-stage");
  await stage.dispatchEvent("touchstart", { changedTouches: [{ identifier: 1, clientX: 310, clientY: 420 }] });
  await stage.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 180, clientY: 425 }] });
  await expect(page.locator(".nav-count")).toHaveText("02 / 13");
  const bounds = await page.locator(".experience-slide.is-active .story-scene").evaluate((element) => {
    const stage = element.closest(".experience-stage")!.getBoundingClientRect();
    const heading = element.querySelector("h1")!.getBoundingClientRect();
    return { stageLeft: stage.left, stageRight: stage.right, headingLeft: heading.left, headingRight: heading.right, sceneWidth: element.clientWidth, stageWidth: stage.width };
  });
  // Decorative orbits may bleed off-canvas by design; headings and the scene box must stay inside the stage.
  expect(bounds.sceneWidth).toBeLessThanOrEqual(bounds.stageWidth + 1);
  expect(bounds.headingLeft).toBeGreaterThanOrEqual(bounds.stageLeft - 1);
  expect(bounds.headingRight).toBeLessThanOrEqual(bounds.stageRight + 1);
});

test("phone landscape keeps the cover and start action inside the stage", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [{ width: 844, height: 390 }, { width: 640, height: 360 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/2026");
    const stage = await page.locator(".experience-stage").boundingBox();
    const start = await page.getByRole("button", { name: /Comenzar/i }).boundingBox();
    expect(start!.y).toBeGreaterThanOrEqual(stage!.y);
    expect(start!.y + start!.height).toBeLessThanOrEqual(stage!.y + stage!.height);
  }
});

test("chapter targets remain usable on narrow phones without stealing their swipe", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/2026#gracias");
  await expect(page.locator(".experience-slide.is-active [data-slide-id]")).toHaveAttribute("data-slide-id", "gracias");
  const targets = await page.locator(".rw-seg").evaluateAll((elements) => elements.map((element) => ({ width: element.getBoundingClientRect().width, height: element.getBoundingClientRect().height })));
  for (const target of targets) { expect(target.width).toBeGreaterThanOrEqual(24); expect(target.height).toBeGreaterThanOrEqual(24); }
  const chapters = page.locator(".rw-chs");
  await chapters.dispatchEvent("touchstart", { changedTouches: [{ identifier: 1, clientX: 250, clientY: 30 }] });
  await chapters.dispatchEvent("touchend", { changedTouches: [{ identifier: 1, clientX: 110, clientY: 30 }] });
  await expect(page).toHaveURL(/#gracias$/);
});

test("image optimizer cannot cache protected assets", async ({ request }) => {
  const token = "x".repeat(43);
  const response = await request.get("/_next/image", { params: { url: `/2026/p/${token}/media/logo.png`, w: "640", q: "75" } });
  expect(response.status()).toBe(400);
});
test("same-document fragments and browser back restore the requested scene", async ({ page }) => {
  await page.goto("/2026#gracias");
  await expect(page.locator(".experience-slide.is-active [data-slide-id]")).toHaveAttribute("data-slide-id", "gracias");
  await page.evaluate(() => { window.location.hash = "cierre"; });
  await expect(page.locator(".experience-slide.is-active [data-slide-id]")).toHaveAttribute("data-slide-id", "cierre");
  await page.goBack();
  await expect(page.locator(".experience-slide.is-active [data-slide-id]")).toHaveAttribute("data-slide-id", "gracias");
  await page.evaluate(() => { window.location.hash = ""; });
  await expect(page.locator(".experience-slide.is-active [data-slide-id]")).toHaveAttribute("data-slide-id", "portada");
});