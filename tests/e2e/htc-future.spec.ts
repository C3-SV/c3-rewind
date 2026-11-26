import { expect, test } from "@playwright/test";

test("additional Hackathon photo slots are available in the general experience", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1920, height: 912 });
  await page.goto("/2026#htc-1");
  const scene = page.locator('.experience-slide.is-active [data-slide-id="htc-1"]');
  for (const slot of ["htc4", "htc5"]) await expect(scene.locator(`[data-slot="${slot}"]`)).toBeVisible();
  const extra = await scene.locator('.h1-extra').boundingBox();
  const hero = await scene.locator('.h1-pn--2').boundingBox();
  expect(extra!.x).toBeGreaterThanOrEqual(hero!.x + hero!.width);
  await page.setViewportSize({ width: 390, height: 844 });
  await scene.locator('[data-slot="htc5"]').scrollIntoViewIfNeeded();
  await expect(scene.locator('[data-slot="htc5"]')).toBeInViewport();
  await page.goto("/dev/preview/2026/applaudo");
  await expect(page.locator('.sc-htc-1 .h1-extra')).toHaveCount(0);
});

test("the invitation enters after the initiatives and stays visible with reduced motion", async ({ page }) => {
  await page.goto("/2026#dos7");
  const invite = page.locator('.experience-slide.is-active .d7-invite');
  await expect(invite).toBeAttached();
  const timing = await invite.evaluate((element) => {
    const animation = element.getAnimations()[0];
    const timing = animation.effect!.getTiming();
    const last = Array.from(document.querySelectorAll('.experience-slide.is-active .d7-txt')).map((item) => item.getAnimations()[0].effect!.getTiming());
    animation.pause();
    animation.currentTime = Number(timing.delay) - 10;
    const before = Number(getComputedStyle(element).opacity);
    animation.currentTime = Number(timing.delay) + Number(timing.duration);
    return { delay: timing.delay, last: Math.max(...last.map((item) => Number(item.delay) + Number(item.duration))), before, after: Number(getComputedStyle(element).opacity) };
  });
  expect(timing.delay).toBeGreaterThanOrEqual(timing.last);
  expect(timing.before).toBe(0);
  expect(timing.after).toBe(1);

  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [{ width: 1600, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await expect(invite).toHaveCSS("opacity", "1");
    const box = await invite.boundingBox();
    const nav = await page.locator('.rw-nav').boundingBox();
    const ribbon = await page.locator('.dev-ribbon').boundingBox();
    const overlaps = (a: NonNullable<typeof box>, b: NonNullable<typeof box>) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    expect(overlaps(box!, nav!)).toBe(false);
    expect(overlaps(box!, ribbon!)).toBe(false);
    for (const item of await page.locator('.experience-slide.is-active .d7-it').all()) {
      const rect = await item.boundingBox();
      expect(overlaps(box!, rect!)).toBe(false);
    }
  }
});
