import { expect, test } from "@playwright/test";

const scenes = ["portada", "gracias", "etapa", "cifras", "copa-col", "copa-uni", "htc-1", "htc-2", "conecta", "somos36", "voces", "dos7", "cierre"];

test("the general scene and its graphics fill the live canvas", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const viewport of [{ width: 1920, height: 912 }, { width: 2560, height: 1080 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/2026");
    await page.getByRole("button", { name: /Comenzar/ }).click();
    await expect(page.locator('.experience-slide.is-active [data-slide-id="gracias"]')).toBeVisible();
    for (const id of scenes) {
      await page.evaluate((hash) => { location.hash = hash; }, id);
      const scene = page.locator(`.experience-slide.is-active [data-slide-id="${id}"]`);
      await expect(scene).toBeVisible();
      const [stage, foreground, composition] = await Promise.all([
        page.locator(".experience-stage").boundingBox(),
        page.locator(".experience-slide.is-active .rw-fg").boundingBox(),
        scene.boundingBox(),
      ]);
      expect(foreground).toEqual(stage);
      expect(composition).toEqual(stage);
    }
    if (viewport.width < viewport.height) {
      await page.evaluate(() => { location.hash = "cifras"; });
      const foot = await page.locator(".experience-slide.is-active .cf-foot").boundingBox();
      const ribbon = await page.locator(".dev-ribbon").boundingBox();
      expect(foot!.y + foot!.height).toBeLessThanOrEqual(ribbon!.y);
      await page.evaluate(() => { location.hash = "conecta"; });
      const tag = await page.locator(".experience-slide.is-active .cn-tag").boundingBox();
      const spots = await page.locator(".experience-slide.is-active .cn-spots").boundingBox();
      expect(tag!.y + tag!.height).toBeLessThanOrEqual(spots!.y);
    }
    await page.evaluate(() => { location.hash = "somos36"; });
    const photo = page.locator(".experience-slide.is-active .sc-somos36[data-real] .sm-whole img");
    await expect(photo).toHaveCSS("object-fit", "contain");
  }
});
