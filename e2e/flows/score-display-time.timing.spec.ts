import { expect, test } from "@playwright/test";
import { scoreWithMeasures } from "../files/generated-scores.ts";
import { slowDownLikeAMidRangePhone } from "../files/slow-phone.ts";
import { SongListPage } from "../pages/song-list-page.ts";
import { ViewerPage } from "../pages/viewer-page.ts";

const DISPLAY_LIMIT_MS = 5000;
const ATTEMPTS = 3;

const median = (values: number[]): number =>
  [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;

test("a 100-measure score is on screen within five seconds on a slowed-down phone", async ({
  page,
}) => {
  const home = new SongListPage(page);
  const viewer = new ViewerPage(page);
  await home.open();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(3000);
  await slowDownLikeAMidRangePhone(page);

  const delays: number[] = [];
  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    const score = scoreWithMeasures(100, `study-${attempt}.musicxml`, `Study ${attempt}`);
    delays.push(await viewer.delayUntilDrawn(() => home.importFiles([score])));
    await viewer.backButton("Back to songs").click();
  }
  console.log(`display time of 100 measures (ms): ${delays.map(Math.round).join(", ")}`);
  expect(median(delays)).toBeLessThan(DISPLAY_LIMIT_MS);
});
