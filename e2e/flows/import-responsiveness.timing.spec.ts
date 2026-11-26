import { expect, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { ImportDialog } from "../pages/import-dialog.ts";
import { SongListPage } from "../pages/song-list-page.ts";

const LONGEST_ACCEPTABLE_FREEZE_MS = 500;

test("the page keeps painting while a batch of large scores is checked", async ({ page }) => {
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  await page.evaluate(() => {
    const gaps: number[] = [];
    let last = performance.now();
    const frame = (now: number): void => {
      gaps.push(now - last);
      last = now;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    (globalThis as unknown as { __gaps: number[] }).__gaps = gaps;
  });
  const batch = ["long-score.musicxml", "orchestral.musicxml", "two-parts.musicxml"];
  await home.importFiles(batch.map(fixturePayload));
  await expect(summary.heading("Import finished")).toBeVisible({ timeout: 30_000 });
  const gaps = await page.evaluate(() => (globalThis as unknown as { __gaps: number[] }).__gaps);
  expect(Math.max(...gaps)).toBeLessThan(LONGEST_ACCEPTABLE_FREEZE_MS);
});
