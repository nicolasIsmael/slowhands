import { expect, test } from "vitest";
import { SystemClock } from "./system-clock.ts";

test("reports the current time in milliseconds", () => {
  const before = Date.now();
  const reading = new SystemClock().now();
  expect(reading).toBeGreaterThanOrEqual(before);
  expect(reading).toBeLessThanOrEqual(Date.now());
});
