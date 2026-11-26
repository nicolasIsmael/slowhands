import type { AnalysisFailureCode } from "../score/analysis-failure-code.ts";
import type { ScoreSummary } from "../score/score-summary.ts";
import type { FileSource } from "./file-source.ts";

export type ScoreAnalysis =
  | {
      readonly status: "accepted";
      readonly summary: ScoreSummary;
      /** The original file, handed back so it can be saved without reading the file twice. */
      readonly bytes: Uint8Array;
    }
  | { readonly status: "rejected"; readonly code: AnalysisFailureCode };

export interface ScoreAnalyzer {
  analyze(source: FileSource): Promise<ScoreAnalysis>;
  /** Called when a batch is over, so anything held for the batch (such as a worker) is freed. */
  release(): void;
}
