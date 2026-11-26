import type { ScoreFormat } from "@core/library/song-record.ts";
import type { AnalysisFailureCode } from "@core/score/analysis-failure-code.ts";
import type { AnalysisResult } from "@core/score/analysis-result.ts";
import type { ScoreNotice } from "@core/score/score-notice.ts";

export interface AnalyzeRequest {
  readonly kind: "analyze";
  readonly id: number;
  readonly fileName: string;
  readonly buffer: ArrayBuffer;
}

export interface PrepareViewRequest {
  readonly kind: "prepare-view";
  readonly id: number;
  readonly format: ScoreFormat;
  readonly buffer: ArrayBuffer;
}

export type WorkerRequest = AnalyzeRequest | PrepareViewRequest;

/** A request as the caller writes it: the channel assigns the id. */
export type RequestBody = Omit<AnalyzeRequest, "id"> | Omit<PrepareViewRequest, "id">;

export interface AnalyzedResponse {
  readonly kind: "analyzed";
  readonly id: number;
  readonly result: AnalysisResult;
  /** The original file, sent back so it can be saved without reading it again. */
  readonly buffer: ArrayBuffer;
}

export interface PreparedResponse {
  readonly kind: "prepared";
  readonly id: number;
  readonly xml: ArrayBuffer;
  readonly notices: readonly ScoreNotice[];
}

export interface FailedResponse {
  readonly kind: "failed";
  readonly id: number;
  readonly code: AnalysisFailureCode;
}

export type WorkerResponse = AnalyzedResponse | PreparedResponse | FailedResponse;
