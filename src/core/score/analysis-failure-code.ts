/** Why a file could not be accepted as a score. The interface turns each code into a message. */
export type AnalysisFailureCode =
  | "unsupported-file-type"
  | "empty-file"
  | "file-too-large"
  | "unpacked-too-large"
  | "archive-corrupted"
  | "archive-without-score"
  | "xml-malformed"
  | "not-a-score"
  | "score-without-music"
  | "file-unreadable"
  | "unexpected-error";
