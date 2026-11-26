import type { Page } from "@playwright/test";

/**
 * Waits until the service worker has stored the whole app and controls the page, which is the
 * point from which the app can be used with no connection. A page that has just installed the
 * worker is not controlled yet, so it is reloaded once.
 */
export async function waitUntilAvailableOffline(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.getByRole("combobox").waitFor();
}
