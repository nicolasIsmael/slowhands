import type { AnalysisFailureCode } from "./analysis-failure-code.ts";
import { MAX_SCORE_FILE_BYTES } from "./limits.ts";
import { hasAcceptedScoreExtension } from "./score-extensions.ts";

/** The checks that need only a file's name and size, so a bad file is refused before it is read. */
export class FilePrecheck {
  private readonly maxBytes: number;

  constructor(maxBytes: number = MAX_SCORE_FILE_BYTES) {
    this.maxBytes = maxBytes;
  }

  check(fileName: string, sizeBytes: number): AnalysisFailureCode | null {
    if (sizeBytes === 0) {
      return "empty-file";
    }
    if (sizeBytes > this.maxBytes) {
      return "file-too-large";
    }
    return hasAcceptedScoreExtension(fileName) ? null : "unsupported-file-type";
  }
}
