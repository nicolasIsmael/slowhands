import { expect, test } from "vitest";
import { countLines, findOversizedFiles } from "./verify-line-limits.ts";

const linesOf = (count: number): string => `${"x\n".repeat(count)}`;

test("counts a trailing newline as the end of the last line, not an extra line", () => {
  expect(countLines("a\nb\n")).toBe(2);
  expect(countLines("a\nb")).toBe(2);
  expect(countLines("")).toBe(0);
});

test("accepts a file of exactly 200 lines", () => {
  expect(findOversizedFiles([{ path: "src/a.ts", text: linesOf(200) }])).toEqual([]);
});

test("rejects a file of 201 lines and names it", () => {
  const problems = findOversizedFiles([{ path: "src/a.ts", text: linesOf(201) }]);
  expect(problems).toEqual(["src/a.ts: 201 lines (limit 200)"]);
});

test("ignores lock files however long they are", () => {
  expect(findOversizedFiles([{ path: "pnpm-lock.yaml", text: linesOf(5000) }])).toEqual([]);
});

test("exempts sample score files but not other files under fixtures", () => {
  const files = [
    { path: "fixtures/scores/long.musicxml", text: linesOf(5000) },
    { path: "fixtures/loader.ts", text: linesOf(201) },
  ];
  expect(findOversizedFiles(files)).toEqual(["fixtures/loader.ts: 201 lines (limit 200)"]);
});
