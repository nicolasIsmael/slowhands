import { expect, type Page, test } from "@playwright/test";
import { fixturePayload } from "../files/fixture-payload.ts";
import { scoreWithMeasures } from "../files/generated-scores.ts";
import { storedSongCount } from "../files/library-database.ts";
import { slowDownLikeAMidRangePhone } from "../files/slow-phone.ts";
import { ImportDialog } from "../pages/import-dialog.ts";
import { SongListPage } from "../pages/song-list-page.ts";

const FILES_IN_BATCH = 30;
const LONGEST_ACCEPTABLE_FREEZE_MS = 500;
const BATCH_TIMEOUT_MS = 240_000;

/** Thirty different scores, the long sample among them, so none counts as a duplicate. */
function thirtyScores() {
  const generated = Array.from({ length: FILES_IN_BATCH - 1 }, (_, index) =>
    scoreWithMeasures(20 + index, `study-${index + 1}.musicxml`, `Study ${index + 1}`),
  );
  return [...generated, fixturePayload("long-score.musicxml")];
}

/** Records the time between painted frames from the moment the person chooses the files. */
async function watchFramesFromTheChoice(page: Page): Promise<void> {
  await page.evaluate(() => {
    const gaps: number[] = [];
    (globalThis as unknown as { __gaps: number[] }).__gaps = gaps;
    document.addEventListener(
      "change",
      () => {
        let last = performance.now();
        const frame = (now: number): void => {
          gaps.push(now - last);
          last = now;
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      },
      { capture: true, once: true },
    );
  });
}

async function measurements(page: Page) {
  const gaps = await page.evaluate(() => (globalThis as unknown as { __gaps: number[] }).__gaps);
  const heapBytes = await page.evaluate(
    () =>
      (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ??
      0,
  );
  return { worstFreezeMs: Math.max(...gaps), heapMb: heapBytes / 2 ** 20 };
}

test("a batch of 30 scores imports completely and the page keeps painting", async ({
  page,
}, testInfo) => {
  test.setTimeout(BATCH_TIMEOUT_MS + 60_000);
  const home = new SongListPage(page);
  const summary = new ImportDialog(page);
  await home.open();
  await slowDownLikeAMidRangePhone(page);
  await watchFramesFromTheChoice(page);

  const started = Date.now();
  await home.importFiles(thirtyScores());
  await expect(summary.heading("Import finished")).toBeVisible({ timeout: BATCH_TIMEOUT_MS });
  const seconds = (Date.now() - started) / 1000;

  await expect(summary.message("30 songs imported")).toBeVisible();
  expect(await storedSongCount(page)).toBe(FILES_IN_BATCH);
  const { worstFreezeMs, heapMb } = await measurements(page);
  testInfo.annotations.push({
    type: "measured",
    description: `${FILES_IN_BATCH} files in ${seconds.toFixed(1)} s at 4x CPU slowdown; longest freeze ${worstFreezeMs.toFixed(0)} ms; JS heap ${heapMb.toFixed(0)} MB`,
  });
  expect(worstFreezeMs).toBeLessThan(LONGEST_ACCEPTABLE_FREEZE_MS);
});
