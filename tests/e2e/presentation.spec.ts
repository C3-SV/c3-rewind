import { expect, test } from "@playwright/test";

test("general experience has thirteen stable slides and keyboard/chapter navigation", async ({ page }) => {
  await page.goto("/2026");
  await expect(page.locator(".story-scene")).toHaveCount(13);
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
  await page.goto("/dev/preview/2026/general");
  await page.emulateMedia({ media: "print" });
  const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true });
  const pageObjects = new TextDecoder().decode(pdf).match(/\/Type\s*\/Page\b/g) ?? [];
  expect(pageObjects).toHaveLength(13);
});

test("private static rendering includes its exclusive fourteenth slide", async ({ page }) => {
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
  const contentBounds = await page.locator(".experience-slide.is-active .scene-copy").evaluate((element) => {
    const content = element.getBoundingClientRect();
    const stageBounds = element.closest(".experience-stage")!.getBoundingClientRect();
    return { contentRight: content.right, stageRight: stageBounds.right, contentWidth: element.clientWidth, scrollWidth: element.scrollWidth };
  });
  expect(contentBounds.contentRight).toBeLessThanOrEqual(contentBounds.stageRight + 1);
  expect(contentBounds.scrollWidth).toBeLessThanOrEqual(contentBounds.contentWidth + 1);
});
