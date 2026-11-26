import type { IdGenerator } from "../identity/id-generator.ts";
import type { DuplicateFinder } from "../library/duplicate-finder.ts";
import { createNewSong } from "../library/new-song.ts";
import type { SongRecord } from "../library/song-record.ts";
import type { SongWriter } from "../library/song-writer.ts";
import { StorageFailure } from "../library/storage-failure.ts";
import type { FilePrecheck } from "../score/file-precheck.ts";
import type { Clock } from "../time/clock.ts";
import type { FileSource } from "./file-source.ts";
import type { FileResult } from "./import-outcome.ts";
import type { ScoreAnalysis, ScoreAnalyzer } from "./score-analyzer.ts";

export interface BatchImportParts {
  precheck: FilePrecheck;
  analyzer: ScoreAnalyzer;
  writer: SongWriter;
  finder: DuplicateFinder;
  ids: IdGenerator;
  clock: Clock;
}

export type AcceptedAnalysis = Extract<ScoreAnalysis, { status: "accepted" }>;

/** Analyzes a file; a crash inside the analyzer becomes a rejection of that one file. */
export async function analyzeSafely(
  { analyzer }: Pick<BatchImportParts, "analyzer">,
  file: FileSource,
): Promise<ScoreAnalysis> {
  try {
    return await analyzer.analyze(file);
  } catch {
    return { status: "rejected", code: "unexpected-error" };
  }
}

export function newSongFrom(
  { ids, clock }: Pick<BatchImportParts, "ids" | "clock">,
  file: FileSource,
  analysis: AcceptedAnalysis,
): SongRecord {
  return createNewSong({
    summary: analysis.summary,
    fileName: file.name,
    byteSize: analysis.bytes.length,
    id: ids.next(),
    now: clock.now(),
  });
}

/** Runs one save and turns any storage error into the failed result of that file. */
export async function savedAs(write: () => Promise<FileResult>): Promise<FileResult> {
  try {
    return await write();
  } catch (error) {
    return {
      kind: "failed",
      code: error instanceof StorageFailure ? error.code : "storage-failed",
    };
  }
}
