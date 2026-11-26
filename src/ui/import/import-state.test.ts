import { ImportSummary } from "@core/import/import-summary.ts";
import { expect, test } from "vitest";
import { IDLE_IMPORT, importReducer } from "./import-state.ts";

const started = importReducer(IDLE_IMPORT, { type: "started", fileNames: ["a.xml", "b.xml"] });

test("starting lists every file as waiting", () => {
  expect(started).toEqual({
    status: "running",
    rows: [
      { position: 0, fileName: "a.xml", step: "waiting", result: null },
      { position: 1, fileName: "b.xml", step: "waiting", result: null },
    ],
  });
});

test("progress updates only the file it is about", () => {
  const next = importReducer(started, {
    type: "progress",
    progress: { fileIndex: 1, fileCount: 2, fileName: "b.xml", step: "checking" },
  });
  expect(next.status === "running" && next.rows.map((row) => row.step)).toEqual([
    "waiting",
    "checking",
  ]);
});

test("a finished file keeps its result", () => {
  const result = { kind: "failed", code: "not-a-score" } as const;
  const next = importReducer(started, {
    type: "progress",
    progress: { fileIndex: 0, fileCount: 2, fileName: "a.xml", step: "done", result },
  });
  expect(next.status === "running" && next.rows[0]?.result).toEqual(result);
});

test("finishing keeps the rows and adds the summary", () => {
  const summary = new ImportSummary([]);
  const next = importReducer(started, { type: "finished", summary });
  expect(next).toMatchObject({ status: "finished", summary });
  expect(next.status === "finished" && next.rows).toHaveLength(2);
});

test("dismissing returns to idle", () => {
  const finished = importReducer(started, { type: "finished", summary: new ImportSummary([]) });
  expect(importReducer(finished, { type: "dismissed" })).toEqual(IDLE_IMPORT);
});

test("ignores progress and finishing when no import is running", () => {
  const progress = { fileIndex: 0, fileCount: 1, fileName: "a", step: "checking" } as const;
  expect(importReducer(IDLE_IMPORT, { type: "progress", progress })).toEqual(IDLE_IMPORT);
  expect(importReducer(IDLE_IMPORT, { type: "finished", summary: new ImportSummary([]) })).toEqual(
    IDLE_IMPORT,
  );
});

const notices = [
  { fileIndex: 0, fileName: "a.xml", existingName: "Etude", reason: "same-content" },
] as const;

test("finding duplicates pauses the import and keeps the rows", () => {
  const next = importReducer(started, { type: "duplicates-found", notices });
  expect(next).toMatchObject({ status: "deciding", notices });
  expect(next.status === "deciding" && next.rows).toHaveLength(2);
});

test("deciding resumes the import with the same rows", () => {
  const asking = importReducer(started, { type: "duplicates-found", notices });
  const next = importReducer(asking, { type: "duplicates-decided" });
  expect(next).toEqual(started);
});

test("ignores duplicates when no import is running", () => {
  expect(importReducer(IDLE_IMPORT, { type: "duplicates-found", notices })).toEqual(IDLE_IMPORT);
  expect(importReducer(started, { type: "duplicates-decided" })).toEqual(started);
});
