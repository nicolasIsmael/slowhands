import type { Page } from "@playwright/test";

/** The stand-in for a mid-range phone: the same browser with the processor slowed down 4 times. */
export async function slowDownLikeAMidRangePhone(page: Page): Promise<void> {
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
}
