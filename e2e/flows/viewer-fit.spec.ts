import { expect, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

async function openScore(home: SongListPage, viewer: ViewerPage): Promise<void> {
  await home.open();
  await home.importFiles([fixturePayload("piano-grand-staff.musicxml")]);
  await expect(viewer.scoreDrawing()).toBeVisible();
}

test("on a small phone screen the score fits the width without sideways scrolling", async ({
  page,
}) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await page.setViewportSize({ width: 360, height: 640 });
  await openScore(home, viewer);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  expect((await viewer.drawingSize()).width).toBeLessThanOrEqual(360);
});

test("rotating the phone lays the score out for the new width", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await page.setViewportSize({ width: 412, height: 915 });
  await openScore(home, viewer);
  const portrait = (await viewer.drawingSize()).width;
  await page.setViewportSize({ width: 915, height: 412 });
  await expect.poll(async () => (await viewer.drawingSize()).width).toBeGreaterThan(portrait + 200);
});

test("resizing the window lays the score out again", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await page.setViewportSize({ width: 900, height: 700 });
  await openScore(home, viewer);
  await page.setViewportSize({ width: 480, height: 700 });
  await expect.poll(async () => (await viewer.drawingSize()).width).toBeLessThanOrEqual(480);
});

test("zooming in makes the score larger, zooming out smaller, and fit brings it back", async ({
  page,
}) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await openScore(home, viewer);
  const fitted = (await viewer.drawingSize()).height;

  await viewer.zoomButton("Zoom in").click();
  await expect.poll(async () => (await viewer.drawingSize()).height).toBeGreaterThan(fitted);
  await expect(viewer.zoomPercent()).toHaveText("125%");

  await viewer.zoomButton("Fit to width").click();
  await expect(viewer.zoomPercent()).toHaveText("100%");
  await viewer.zoomButton("Zoom out").click();
  await expect.poll(async () => (await viewer.drawingSize()).height).toBeLessThan(fitted);
});

test("the keyboard zooms the score", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await openScore(home, viewer);
  await page.keyboard.press("+");
  await expect(viewer.zoomPercent()).toHaveText("125%");
  await page.keyboard.press("0");
  await expect(viewer.zoomPercent()).toHaveText("100%");
});

test("zoom stops at its largest and smallest sizes", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await openScore(home, viewer);
  for (let step = 0; step < 8; step += 1) {
    await viewer.zoomButton("Zoom in").click();
  }
  await expect(viewer.zoomPercent()).toHaveText("300%");
  await expect(viewer.zoomButton("Zoom in")).toBeDisabled();
});

test("the page itself can still be zoomed by the person", async ({ page }) => {
  const home = new SongListPage(page);
  await home.open();
  const viewport = await page.locator('meta[name="viewport"]').getAttribute("content");
  expect(viewport).not.toMatch(/user-scalable\s*=\s*(no|0)/);
  expect(viewport).not.toMatch(/maximum-scale/);
});
