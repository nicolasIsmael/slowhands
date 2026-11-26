import { expect, test } from "@playwright/test";
import { truncatedScore } from "../files/generated-scores.ts";
import { slowDownLikeAMidRangePhone } from "../files/slow-phone.ts";
import { ImportDialog } from "../pages/import-dialog.ts";
import { SongListPage } from "../pages/song-list-page.ts";

const MEBIBYTE = 1024 * 1024;
const DAMAGED = "The file is damaged or incomplete";
const DAMAGED_ES = "El archivo está dañado o incompleto";

test("a damaged 5 MiB file is explained within two seconds on a slowed-down phone", async ({
  page,
}) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  await slowDownLikeAMidRangePhone(page);
  const delay = await summary.explanationDelay(DAMAGED, () =>
    home.importFiles([truncatedScore(5 * MEBIBYTE)]),
  );
  expect(delay).toBeLessThan(2000);
});

test("the same damaged file is explained in Spanish just as fast", async ({ page }) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  await home.chooseLanguage("Language", "es");
  await slowDownLikeAMidRangePhone(page);
  const delay = await summary.explanationDelay(DAMAGED_ES, () =>
    home.importFiles([truncatedScore(5 * MEBIBYTE)], "Importar partituras"),
  );
  expect(delay).toBeLessThan(2000);
});

test("a larger damaged file shows progress while it is checked, then its explanation", async ({
  page,
}) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  await slowDownLikeAMidRangePhone(page);
  await home.importFiles([truncatedScore(15 * MEBIBYTE)]);
  await expect(summary.heading("Importing scores")).toBeVisible();
  await expect(summary.message(DAMAGED)).toBeVisible({ timeout: 60_000 });
});
