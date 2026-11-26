import { expect, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

test("importing one score shows it ready to read", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  const address = page.url();
  await home.importFiles([fixturePayload("piano-grand-staff.musicxml")]);
  await expect(viewer.title("Morning Study")).toBeVisible();
  await expect(viewer.scoreDrawing()).toBeVisible();
  expect(page.url()).toBe(address);
});

test("a compressed score is shown the same way", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await home.importFiles([fixturePayload("piano-grand-staff.mxl")]);
  await expect(viewer.title("Morning Study")).toBeVisible();
  await expect(viewer.scoreDrawing()).toBeVisible();
});

test("a score with no title is shown under its file name", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await home.importFiles([fixturePayload("no-title-no-composer.musicxml")]);
  await expect(viewer.title("no-title-no-composer")).toBeVisible();
  await expect(viewer.scoreDrawing()).toBeVisible();
});

test("accents, non-Latin characters and emoji are shown as written", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await home.importFiles([fixturePayload("Café ñandú 🎹.musicxml")]);
  await expect(viewer.title("Canción de Cuna 🎹")).toBeVisible();
});

test("the back button returns to the song list", async ({ page }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await home.importFiles([fixturePayload("single-staff.musicxml")]);
  await expect(viewer.scoreDrawing()).toBeVisible();
  await viewer.backButton("Back to songs").click();
  await expect(home.importControl()).toBeVisible();
});
