// Every pattern is assembled from fragments so that this file never contains the literals it forbids.
const WORKFLOW_FOLDERS = [
  [".", "spec", "ify"],
  [".", "cla", "ude"],
  ["spec", "s/"],
].map((parts) => parts.join(""));

const IDENTIFIER_PREFIXES = [
  ["F", "R"],
  ["S", "C"],
  ["U", "S"],
].map((parts) => parts.join(""));

const escapeForPattern = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface TracePattern {
  label: string;
  pattern: RegExp;
}

export interface TraceFinding {
  line: number;
  label: string;
}

export const TRACE_PATTERNS: TracePattern[] = [
  {
    label: "reference to a workflow folder",
    pattern: new RegExp(WORKFLOW_FOLDERS.map(escapeForPattern).join("|")),
  },
  {
    label: "requirement, criterion or story identifier",
    pattern: new RegExp(`\\b(${IDENTIFIER_PREFIXES.join("|")})-?\\d{1,3}\\b`),
  },
  { label: "task identifier", pattern: /\bT\d{3}\b/ },
  {
    label: "phrase pointing at a specification",
    pattern: new RegExp(["per the", "spec"].join(" "), "i"),
  },
];

export function findTraces(text: string): TraceFinding[] {
  return text.split("\n").flatMap((content, index) =>
    TRACE_PATTERNS.filter(({ pattern }) => pattern.test(content)).map(({ label }) => ({
      line: index + 1,
      label,
    })),
  );
}
