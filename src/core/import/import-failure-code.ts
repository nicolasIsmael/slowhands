import type { StorageFailureCode } from "../library/storage-failure.ts";
import type { AnalysisFailureCode } from "../score/analysis-failure-code.ts";

export type ImportFailureCode = AnalysisFailureCode | StorageFailureCode;
