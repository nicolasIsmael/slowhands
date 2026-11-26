import { expect, test } from "vitest";
import { validateCommitMessage } from "./verify-commit-message.ts";

test("accepts a conventional header with and without a scope", () => {
  expect(validateCommitMessage("feat(core): add the score file classifier")).toEqual([]);
  expect(validateCommitMessage("docs: explain the folder structure")).toEqual([]);
});

test("accepts a breaking-change marker", () => {
  expect(validateCommitMessage("refactor(storage)!: rename the songs table")).toEqual([]);
});

test("rejects a header without a type", () => {
  expect(validateCommitMessage("add the classifier")).toHaveLength(1);
});

test("rejects an unknown type and a missing description", () => {
  expect(validateCommitMessage("update: add the classifier")).toHaveLength(1);
  expect(validateCommitMessage("feat:")).toHaveLength(1);
});

test("rejects a header longer than 72 characters", () => {
  const header = `feat: ${"a".repeat(70)}`;
  expect(validateCommitMessage(header)).toEqual([expect.stringContaining("limit 72")]);
});

test("rejects a message that mentions a task identifier", () => {
  const message = `feat: add the classifier\n\nFinishes ${["T", "012"].join("")}`;
  expect(validateCommitMessage(message)).toEqual(["message contains a task identifier"]);
});

test("lets merge commits through", () => {
  expect(validateCommitMessage("Merge branch 'feature'")).toEqual([]);
});
