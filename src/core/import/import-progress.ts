import type { FileSource } from "./file-source.ts";
import type { FileResult } from "./import-outcome.ts";

/** `duplicate` means the file matches a song already in the library and waits for a decision. */
export type ImportStep = "checking" | "saving" | "duplicate" | "done";

/** One step of one file; the `done` step carries the file's result as soon as it is known. */
export interface ImportProgress {
  readonly fileIndex: number;
  readonly fileCount: number;
  readonly fileName: string;
  readonly step: ImportStep;
  readonly result?: FileResult;
}

export type ProgressListener = (progress: ImportProgress) => void;
export type ProgressReporter = (fileIndex: number, step: ImportStep, result?: FileResult) => void;

export function reporterFor(
  files: readonly FileSource[],
  onProgress: ProgressListener,
): ProgressReporter {
  return (fileIndex, step, result) =>
    onProgress({
      fileIndex,
      fileCount: files.length,
      fileName: files[fileIndex]?.name ?? "",
      step,
      ...(result && { result }),
    });
}
