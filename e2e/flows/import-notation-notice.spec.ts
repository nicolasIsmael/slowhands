import { expect, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

test("a score with notation the viewer cannot draw is shown with a notice", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await home.importFiles([fixturePayload("unsupported-notation.musicxml")]);
  await expect(viewer.scoreDrawing()).toBeVisible();
  await expect(viewer.notice()).toHaveText("Some symbols in this score may not be displayed.");
});

test("the notice follows the interface language", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await home.importFiles([fixturePayload("unsupported-notation.musicxml")]);
  await expect(viewer.notice()).toBeVisible();
  await home.chooseLanguage("Language", "es");
  await expect(viewer.notice()).toHaveText(
    "Es posible que algunos símbolos de esta partitura no se muestren.",
  );
});

test("a plain score is shown without any notice", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await home.importFiles([fixturePayload("piano-grand-staff.musicxml")]);
  await expect(viewer.scoreDrawing()).toBeVisible();
  await expect(viewer.notice()).toHaveCount(0);
});
