import { expect, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { storedSongCount } from "../files/library-database.ts";
import { waitUntilAvailableOffline } from "../files/offline.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

const MELODY = "Simple Melody Test Composer";
const DUET = "Duet for Two Voices Test Composer";

async function importAndReturn(home: SongListPage, viewer: ViewerPage, file: string) {
  await home.importFiles([fixturePayload(file)]);
  await expect(viewer.scoreDrawing()).toBeVisible();
  await viewer.backButton("Back to songs").click();
}

test("after first use, the list and every song open with no connection", async ({
  page,
  context,
}) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await waitUntilAvailableOffline(page);
  await importAndReturn(home, viewer, "single-staff.musicxml");
  await importAndReturn(home, viewer, "two-parts.musicxml");

  await context.setOffline(true);
  await page.reload();
  await expect(home.songRows()).toHaveText([DUET, MELODY]);

  for (const name of ["Simple Melody", "Duet for Two Voices"]) {
    await home.songButton(name).click();
    await expect(viewer.scoreDrawing()).toBeVisible();
    await viewer.backButton("Back to songs").click();
  }
});

test("a file can be imported while offline, and is still there after a reload", async ({
  page,
  context,
}) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await waitUntilAvailableOffline(page);
  await context.setOffline(true);

  await home.importFiles([fixturePayload("single-staff.musicxml")]);
  await expect(viewer.scoreDrawing()).toBeVisible();
  await page.reload();
  await expect(home.songRows()).toHaveText([MELODY]);
  expect(await storedSongCount(page)).toBe(1);
});

test("reloading offline while reading a score returns to the list", async ({ page, context }) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await waitUntilAvailableOffline(page);
  await home.importFiles([fixturePayload("single-staff.musicxml")]);
  await expect(viewer.scoreDrawing()).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(home.songRows()).toHaveText([MELODY]);
  await expect(viewer.scoreDrawing()).toHaveCount(0);
});

test("the Spanish interface also works offline", async ({ page, context }) => {
  const home = new SongListPage(page);
  await home.open();
  await home.chooseLanguage("Language", "es");
  await waitUntilAvailableOffline(page);
  await context.setOffline(true);
  await page.reload();
  await expect(home.importButton("Importar partituras")).toBeVisible();
  expect(await home.documentLanguage()).toBe("es");
});
