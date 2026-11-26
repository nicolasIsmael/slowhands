import type { Page } from "@playwright/test";

/** Starts counting every click in the page, so a flow can be held to a number of taps. */
export async function startCountingTaps(page: Page): Promise<void> {
  await page.evaluate(() => {
    const counter = globalThis as unknown as { __taps: number };
    counter.__taps = 0;
    document.addEventListener(
      "click",
      () => {
        counter.__taps += 1;
      },
      { capture: true },
    );
  });
}

export function tapsSoFar(page: Page): Promise<number> {
  return page.evaluate(() => (globalThis as unknown as { __taps: number }).__taps);
}
