import { expect, test, vi } from "vitest";
import { ImportActivity } from "./import-activity.ts";

test("is idle until an import begins", () => {
  expect(new ImportActivity().isBusy()).toBe(false);
});

test("is busy from the start of an import until its end", () => {
  const activity = new ImportActivity();
  activity.begin();
  expect(activity.isBusy()).toBe(true);
  activity.end();
  expect(activity.isBusy()).toBe(false);
});

test("stays busy until every import that began has ended", () => {
  const activity = new ImportActivity();
  activity.begin();
  activity.begin();
  activity.end();
  expect(activity.isBusy()).toBe(true);
  activity.end();
  expect(activity.isBusy()).toBe(false);
});

test("never goes below idle when an end is reported twice", () => {
  const activity = new ImportActivity();
  activity.end();
  activity.begin();
  expect(activity.isBusy()).toBe(true);
});

test("tells listeners each time the activity changes, until they stop listening", () => {
  const activity = new ImportActivity();
  const listener = vi.fn();
  const stop = activity.subscribe(listener);
  activity.begin();
  activity.end();
  stop();
  activity.begin();
  expect(listener).toHaveBeenCalledTimes(2);
});
