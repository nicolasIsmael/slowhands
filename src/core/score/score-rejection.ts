import type { AnalysisFailureCode } from "./analysis-failure-code.ts";

/** Thrown while checking a file when the file cannot be accepted. */
export class ScoreRejection extends Error {
  readonly code: AnalysisFailureCode;

  constructor(code: AnalysisFailureCode) {
    super(code);
    this.name = "ScoreRejection";
    this.code = code;
  }
}
