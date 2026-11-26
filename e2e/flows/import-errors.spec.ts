import { expect, test } from "@playwright/test";
import { storedSongCount } from "../files/library-database.ts";
import { UNUSABLE_FILES } from "../files/unusable-files.ts";
import { ImportDialog } from "../pages/import-dialog.ts";
import { SongListPage } from "../pages/song-list-page.ts";

test("every unusable file is explained in English and nothing is saved", async ({ page }) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  for (const { file, english } of UNUSABLE_FILES) {
    await home.importFiles([file()]);
    await expect(summary.message(english)).toBeVisible();
    await summary.closeButton("Close").click();
  }
  expect(await storedSongCount(page)).toBe(0);
});

test("every unusable file is explained in Spanish and nothing is saved", async ({ page }) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  await home.chooseLanguage("Language", "es");
  for (const { file, spanish } of UNUSABLE_FILES) {
    await home.importFiles([file()], "Importar partituras");
    await expect(summary.message(spanish)).toBeVisible();
    await summary.closeButton("Cerrar").click();
  }
  expect(await storedSongCount(page)).toBe(0);
});
