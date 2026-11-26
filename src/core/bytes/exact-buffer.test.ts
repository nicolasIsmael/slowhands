import { expect, test } from "vitest";
import { exactBuffer } from "./exact-buffer.ts";

test("returns the same buffer when the bytes cover all of it", () => {
  const bytes = Uint8Array.from([1, 2, 3]);
  expect(exactBuffer(bytes)).toBe(bytes.buffer);
});

test("returns a copy holding only the viewed bytes when they are a slice of a larger buffer", () => {
  const whole = Uint8Array.from([1, 2, 3, 4, 5]);
  const part = whole.subarray(1, 3);
  const buffer = exactBuffer(part);
  expect(buffer.byteLength).toBe(2);
  expect(Array.from(new Uint8Array(buffer))).toEqual([2, 3]);
});
