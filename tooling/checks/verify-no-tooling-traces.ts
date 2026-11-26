import { type RepositoryFile, readRepositoryTextFiles } from "./repository-files.ts";
import { findTraces } from "./tooling-trace-patterns.ts";

const EXEMPT_PATHS = [/(^|\/)pnpm-lock\.yaml$/, /^fixtures\/scores\//];

export function findTraceProblems(files: RepositoryFile[]): string[] {
  return files
    .filter((file) => !EXEMPT_PATHS.some((pattern) => pattern.test(file.path)))
    .flatMap((file) =>
      findTraces(file.text).map(({ line, label }) => `${file.path}:${line}: ${label}`),
    );
}

if (import.meta.main) {
  const problems = findTraceProblems(readRepositoryTextFiles());
  for (const problem of problems) {
    console.error(problem);
  }
  process.exit(problems.length === 0 ? 0 : 1);
}
