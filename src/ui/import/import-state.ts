import type { DuplicateNotice } from "@core/import/duplicate-decision.ts";
import type { FileResult } from "@core/import/import-outcome.ts";
import type { ImportProgress, ImportStep } from "@core/import/import-progress.ts";
import type { ImportSummary } from "@core/import/import-summary.ts";

export interface ImportRow {
  /** The file's place in the batch; it identifies the row even if two files share a name. */
  readonly position: number;
  readonly fileName: string;
  readonly step: ImportStep | "waiting";
  readonly result: FileResult | null;
}

export type ImportState =
  | { readonly status: "idle" }
  | { readonly status: "running"; readonly rows: readonly ImportRow[] }
  | {
      readonly status: "deciding";
      readonly rows: readonly ImportRow[];
      readonly notices: readonly DuplicateNotice[];
    }
  | {
      readonly status: "finished";
      readonly rows: readonly ImportRow[];
      readonly summary: ImportSummary;
    };

export type ImportAction =
  | { readonly type: "started"; readonly fileNames: readonly string[] }
  | { readonly type: "progress"; readonly progress: ImportProgress }
  | { readonly type: "duplicates-found"; readonly notices: readonly DuplicateNotice[] }
  | { readonly type: "duplicates-decided" }
  | { readonly type: "finished"; readonly summary: ImportSummary }
  | { readonly type: "dismissed" };

export const IDLE_IMPORT: ImportState = { status: "idle" };

function withProgress(rows: readonly ImportRow[], progress: ImportProgress): ImportRow[] {
  return rows.map((row, index) =>
    index === progress.fileIndex
      ? {
          position: row.position,
          fileName: row.fileName,
          step: progress.step,
          result: progress.result ?? null,
        }
      : row,
  );
}

function waitingRows(fileNames: readonly string[]): ImportRow[] {
  return fileNames.map((fileName, position) => ({
    position,
    fileName,
    step: "waiting",
    result: null,
  }));
}

function whileRunning(state: ImportState, next: (rows: readonly ImportRow[]) => ImportState) {
  return state.status === "running" ? next(state.rows) : state;
}

export function importReducer(state: ImportState, action: ImportAction): ImportState {
  switch (action.type) {
    case "started":
      return { status: "running", rows: waitingRows(action.fileNames) };
    case "progress":
      return whileRunning(state, (rows) => ({
        status: "running",
        rows: withProgress(rows, action.progress),
      }));
    case "duplicates-found":
      return whileRunning(state, (rows) => ({ status: "deciding", rows, notices: action.notices }));
    case "duplicates-decided":
      return state.status === "deciding" ? { status: "running", rows: state.rows } : state;
    case "finished":
      return whileRunning(state, (rows) => ({ status: "finished", rows, summary: action.summary }));
    case "dismissed":
      return IDLE_IMPORT;
  }
}
