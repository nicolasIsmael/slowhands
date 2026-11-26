import type { ImportFailureCode } from "@core/import/import-failure-code.ts";

/** The message key (without `.title` or `.hint`) that explains each failure; a missing code does not compile. */
export const FAILURE_KEYS = {
  "unsupported-file-type": "failure.unsupportedFileType",
  "empty-file": "failure.emptyFile",
  "file-too-large": "failure.fileTooLarge",
  "unpacked-too-large": "failure.unpackedTooLarge",
  "archive-corrupted": "failure.archiveCorrupted",
  "archive-without-score": "failure.archiveWithoutScore",
  "xml-malformed": "failure.xmlMalformed",
  "not-a-score": "failure.notAScore",
  "score-without-music": "failure.scoreWithoutMusic",
  "file-unreadable": "failure.fileUnreadable",
  "unexpected-error": "failure.unexpectedError",
  "storage-full": "failure.storageFull",
  "storage-failed": "failure.storageFailed",
} as const satisfies Record<ImportFailureCode, `failure.${string}`>;

export type FailureKey = (typeof FAILURE_KEYS)[ImportFailureCode];

export function failureKeyFor(code: ImportFailureCode): FailureKey {
  return FAILURE_KEYS[code];
}
