import type { AnalysisFailureCode } from "./analysis-failure-code.ts";
import type { ScoreSummary } from "./score-summary.ts";

export type AnalysisResult =
  | { readonly status: "accepted"; readonly summary: ScoreSummary }
  | { readonly status: "rejected"; readonly code: AnalysisFailureCode };
