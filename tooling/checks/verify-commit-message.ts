import { readFileSync } from "node:fs";
import { findTraces } from "./tooling-trace-patterns.ts";

const TYPES = "feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert";
const HEADER = new RegExp(`^(${TYPES})(\\([a-z0-9-]+\\))?!?: \\S.*$`);
const MAX_HEADER_LENGTH = 72;

export function validateCommitMessage(message: string): string[] {
  const header = message.split("\n")[0] ?? "";
  if (header.startsWith("Merge ") || header.startsWith('Revert "')) {
    return [];
  }
  const problems: string[] = [];
  if (!HEADER.test(header)) {
    problems.push(`header must look like "type(scope): description" with type ${TYPES}`);
  }
  if (header.length > MAX_HEADER_LENGTH) {
    problems.push(`header is ${header.length} characters (limit ${MAX_HEADER_LENGTH})`);
  }
  for (const { label } of findTraces(message)) {
    problems.push(`message contains a ${label}`);
  }
  return problems;
}

if (import.meta.main) {
  const path = process.argv[2];
  const problems = path
    ? validateCommitMessage(readFileSync(path, "utf8"))
    : ["no message file given"];
  for (const problem of problems) {
    console.error(problem);
  }
  process.exit(problems.length === 0 ? 0 : 1);
}
