import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { findTraces } from "./tooling-trace-patterns.ts";
import { findTraceProblems } from "./verify-no-tooling-traces.ts";

const folder = (...parts: string[]): string => parts.join("");

test("flags a reference to a workflow folder", () => {
  const text = `see ${folder(".", "spec", "ify")}/memory for details`;
  expect(findTraces(text)).toEqual([{ line: 1, label: "reference to a workflow folder" }]);
});

test("flags requirement, criterion and story identifiers", () => {
  for (const id of [folder("F", "R-001"), folder("S", "C-004"), folder("U", "S3")]) {
    expect(findTraces(`covers ${id}`)).toHaveLength(1);
  }
});

test("flags a task identifier and a pointer at a specification", () => {
  expect(findTraces(`done in ${folder("T", "012")}`)).toHaveLength(1);
  expect(findTraces(folder("per the ", "spec"))).toHaveLength(1);
});

test("reports the line number of each finding", () => {
  const problems = findTraceProblems([
    { path: "README.md", text: `fine\nfix ${folder("T", "101")}\n` },
  ]);
  expect(problems).toEqual(["README.md:2: task identifier"]);
});

test("ignores sample score files and lock files", () => {
  const text = `id ${folder("T", "012")}`;
  expect(findTraceProblems([{ path: "fixtures/scores/a.musicxml", text }])).toEqual([]);
  expect(findTraceProblems([{ path: "pnpm-lock.yaml", text }])).toEqual([]);
});

test("the check and its tests contain none of the forbidden literals", () => {
  const files = [
    "tooling/checks/tooling-trace-patterns.ts",
    "tooling/checks/verify-no-tooling-traces.ts",
    "tooling/checks/verify-no-tooling-traces.test.ts",
    "tooling/checks/verify-commit-message.ts",
    "tooling/checks/verify-commit-message.test.ts",
  ];
  for (const path of files) {
    expect(findTraces(readFileSync(path, "utf8")), path).toEqual([]);
  }
});
