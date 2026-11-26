import { expect, test, vi } from "vitest";
import { Flag } from "./flag.ts";

test("tells a new subscriber the current value at once", () => {
  const flag = new Flag();
  const seen: boolean[] = [];
  flag.subscribe((value) => seen.push(value));
  expect(seen).toEqual([false]);
});

test("tells subscribers when it is raised, once", () => {
  const flag = new Flag();
  const seen: boolean[] = [];
  flag.subscribe((value) => seen.push(value));
  flag.raise();
  flag.raise();
  expect(seen).toEqual([false, true]);
});

test("a late subscriber sees that it was already raised", () => {
  const flag = new Flag();
  flag.raise();
  const onValue = vi.fn();
  flag.subscribe(onValue);
  expect(onValue).toHaveBeenCalledExactlyOnceWith(true);
});

test("stops telling someone who unsubscribed", () => {
  const flag = new Flag();
  const onValue = vi.fn();
  const unsubscribe = flag.subscribe(onValue);
  unsubscribe();
  flag.raise();
  expect(onValue).toHaveBeenCalledTimes(1);
});

test("can be lowered again, and tells subscribers once", () => {
  const flag = new Flag();
  const seen: boolean[] = [];
  flag.subscribe((value) => seen.push(value));
  flag.raise();
  flag.lower();
  flag.lower();
  expect(seen).toEqual([false, true, false]);
});
