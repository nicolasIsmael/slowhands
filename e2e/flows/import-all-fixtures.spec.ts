import { expect, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { storedSongCount } from "../files/library-database.ts";
import { ImportDialog } from "../pages/import-dialog.ts";
import { SongListPage } from "../pages/song-list-page.ts";

const DISTINCT_SCORES = [
  "piano-grand-staff.musicxml",
  "single-staff.musicxml",
  "two-parts.musicxml",
  "orchestral.musicxml",
  "extension-xml.xml",
  "no-title-no-composer.musicxml",
  "Café ñandú 🎹.musicxml",
  "unsupported-notation.musicxml",
  "long-score.musicxml",
];

test("every distinct well-formed sample score imports in a single batch", async ({ page }) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  await home.importFiles(DISTINCT_SCORES.map(fixturePayload));
  await expect(summary.heading("Import finished")).toBeVisible({ timeout: 30_000 });
  await expect(summary.message("9 songs imported")).toBeVisible();
  expect(await storedSongCount(page)).toBe(9);
});
