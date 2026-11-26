import { type RepositoryFile, readRepositoryTextFiles } from "./repository-files.ts";

export const MAX_LINES = 200;

const EXEMPT_PATHS = [/(^|\/)pnpm-lock\.yaml$/, /^fixtures\/scores\//];

export function countLines(text: string): number {
  if (text === "") {
    return 0;
  }
  const lines = text.split("\n").length;
  return text.endsWith("\n") ? lines - 1 : lines;
}

export function findOversizedFiles(files: RepositoryFile[], limit = MAX_LINES): string[] {
  return files
    .filter((file) => !EXEMPT_PATHS.some((pattern) => pattern.test(file.path)))
    .filter((file) => countLines(file.text) > limit)
    .map((file) => `${file.path}: ${countLines(file.text)} lines (limit ${limit})`);
}

if (import.meta.main) {
  const problems = findOversizedFiles(readRepositoryTextFiles());
  for (const problem of problems) {
    console.error(problem);
  }
  process.exit(problems.length === 0 ? 0 : 1);
}
