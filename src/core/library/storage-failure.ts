export type StorageFailureCode = "storage-full" | "storage-failed";

export class StorageFailure extends Error {
  readonly code: StorageFailureCode;

  constructor(code: StorageFailureCode, cause?: unknown) {
    super(code, { cause });
    this.name = "StorageFailure";
    this.code = code;
  }
}
