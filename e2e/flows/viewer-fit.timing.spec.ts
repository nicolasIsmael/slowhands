import { expect, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { slowDownLikeAMidRangePhone } from "../files/slow-phone.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

const REFIT_LIMIT_MS = 1000;

test("after the phone is rotated the score fits the new width within one second", async ({
  page,
}) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await page.setViewportSize({ width: 412, height: 915 });
  await home.open();
  await home.importFiles([fixturePayload("piano-grand-staff.musicxml")]);
  await expect(viewer.scoreDrawing()).toBeVisible();
  const portraitWidth = (await viewer.drawingSize()).width;
  await slowDownLikeAMidRangePhone(page);

  await page.setViewportSize({ width: 915, height: 412 });
  const rotated = Date.now();
  await expect
    .poll(async () => (await viewer.drawingSize()).width, { intervals: [50], timeout: 5000 })
    .toBeGreaterThan(portraitWidth + 200);
  expect(Date.now() - rotated).toBeLessThan(REFIT_LIMIT_MS);
});
