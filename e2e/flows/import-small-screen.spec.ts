import { expect, test } from "@playwright/test";
import { SongListPage } from "../pages/song-list-page.ts";

test("the import control is visible on a small phone screen without scrolling", async ({
  page,
}) => {
  const home = new SongListPage(page);
  await page.setViewportSize({ width: 360, height: 640 });
  await home.open();
  await expect(home.importButton()).toBeInViewport({ ratio: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});
