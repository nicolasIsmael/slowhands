import type { DuplicateMatch } from "../library/duplicate-match.ts";
import { type HeldDuplicate, noticeFor, resolveHeld } from "./batch-duplicates.ts";
import type { DuplicateDecider, DuplicateDecision } from "./duplicate-decision.ts";
import type { FileSource } from "./file-source.ts";
import type { FileResult } from "./import-outcome.ts";
import {
  type AcceptedAnalysis,
  analyzeSafely,
  type BatchImportParts,
  newSongFrom,
  savedAs,
} from "./import-parts.ts";
import {
  type ImportStep,
  type ProgressListener,
  type ProgressReporter,
  reporterFor,
} from "./import-progress.ts";
import type { ImportRunner } from "./import-runner.ts";
import { ImportSummary } from "./import-summary.ts";

export type { BatchImportParts } from "./import-parts.ts";

type Verdict = FileResult | { readonly kind: "duplicate"; readonly match: DuplicateMatch };

const UNKNOWN_FAILURE: FileResult = { kind: "failed", code: "unexpected-error" };

/**
 * Imports the picked files one at a time. Each file is checked, and a new song is saved at
 * once, so a failure never touches the files before or after it. Files that match a song in the
 * library wait until every file has been seen, then share one decision.
 */
export class BatchImport implements ImportRunner {
  private readonly parts: BatchImportParts;

  constructor(parts: BatchImportParts) {
    this.parts = parts;
  }

  async run(
    files: readonly FileSource[],
    onProgress: ProgressListener,
    decideDuplicates: DuplicateDecider,
  ): Promise<ImportSummary> {
    const report = reporterFor(files, onProgress);
    const results = new Map<number, FileResult>();
    const held: HeldDuplicate[] = [];
    try {
      for (const [fileIndex, file] of files.entries()) {
        const verdict = await this.importOne(file, (step) => report(fileIndex, step));
        if (verdict.kind === "duplicate") {
          held.push({ fileIndex, file, match: verdict.match });
          report(fileIndex, "duplicate");
        } else {
          results.set(fileIndex, verdict);
          report(fileIndex, "done", verdict);
        }
      }
      await this.settle(held, decideDuplicates, report, results);
    } finally {
      this.parts.analyzer.release();
    }
    return new ImportSummary(
      files.map((file, index) => ({
        fileName: file.name,
        result: results.get(index) ?? UNKNOWN_FAILURE,
      })),
    );
  }

  private async settle(
    held: readonly HeldDuplicate[],
    decide: DuplicateDecider,
    report: ProgressReporter,
    results: Map<number, FileResult>,
  ): Promise<void> {
    if (held.length === 0) {
      return;
    }
    const decision = await askSafely(decide, held);
    for (const item of held) {
      report(item.fileIndex, "saving");
      const result = await resolveHeld(this.parts, decision, item);
      results.set(item.fileIndex, result);
      report(item.fileIndex, "done", result);
    }
  }

  private async importOne(file: FileSource, report: (step: ImportStep) => void): Promise<Verdict> {
    report("checking");
    const refusal = this.parts.precheck.check(file.name, file.sizeBytes);
    if (refusal !== null) {
      return { kind: "failed", code: refusal };
    }
    const analysis = await analyzeSafely(this.parts, file);
    if (analysis.status === "rejected") {
      return { kind: "failed", code: analysis.code };
    }
    report("saving");
    return this.saveUnlessDuplicate(file, analysis);
  }

  private async saveUnlessDuplicate(
    file: FileSource,
    analysis: AcceptedAnalysis,
  ): Promise<Verdict> {
    const song = newSongFrom(this.parts, file, analysis);
    try {
      const match = await this.parts.finder.findDuplicate(song);
      if (match !== null) {
        return { kind: "duplicate", match };
      }
    } catch {
      return { kind: "failed", code: "storage-failed" };
    }
    return savedAs(async () => {
      await this.parts.writer.add(song, analysis.bytes);
      return { kind: "imported", songId: song.id };
    });
  }
}

/** A question that cannot be answered changes nothing, exactly like closing it. */
async function askSafely(
  decide: DuplicateDecider,
  held: readonly HeldDuplicate[],
): Promise<DuplicateDecision> {
  try {
    return await decide(held.map(noticeFor));
  } catch {
    return "skip-all";
  }
}
