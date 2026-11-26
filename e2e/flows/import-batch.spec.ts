import { expect, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { storedSongCount } from "../files/library-database.ts";
import { ImportDialog } from "../pages/import-dialog.ts";
import { SongListPage } from "../pages/song-list-page.ts";

const mixedBatch = () => [
  fixturePayload("single-staff.musicxml"),
  fixturePayload("unsupported/score.pdf"),
  fixturePayload("two-parts.musicxml"),
  fixturePayload("invalid/truncated.musicxml"),
];

test("a mixed batch imports the good files and explains the bad ones in one summary", async ({
  page,
}) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  await home.importFiles(mixedBatch());
  await expect(summary.heading("Import finished")).toBeVisible();
  await expect(summary.message("2 songs imported · 2 files could not be imported")).toBeVisible();
  await expect(summary.message("This file type is not supported yet")).toBeVisible();
  await expect(summary.message("The file is damaged or incomplete")).toBeVisible();
});

test("only the files that worked are saved", async ({ page }) => {
  const home = new SongListPage(page);
  await home.open();
  await home.importFiles(mixedBatch());
  await expect(new ImportDialog(page).heading("Import finished")).toBeVisible();
  expect(await storedSongCount(page)).toBe(2);
});

test("closing the summary returns to the list", async ({ page }) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  await home.importFiles(mixedBatch());
  await summary.closeButton("Close").click();
  await expect(summary.heading("Import finished")).toBeHidden();
  await expect(home.importControl()).toBeVisible();
});

test("the summary is written in Spanish when the interface is Spanish", async ({ page }) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  await home.chooseLanguage("Language", "es");
  await home.importFiles(mixedBatch(), "Importar partituras");
  await expect(summary.heading("Importación terminada")).toBeVisible();
  await expect(
    summary.message("2 canciones importadas · 2 archivos no se pudieron importar"),
  ).toBeVisible();
});
