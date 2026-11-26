import { StorageFailure } from "@core/library/storage-failure.ts";

function isQuotaError(error: unknown): boolean {
  const named = error as { name?: string; inner?: { name?: string } } | null;
  return named?.name === "QuotaExceededError" || named?.inner?.name === "QuotaExceededError";
}

/** Turns whatever the database threw into a typed failure the rest of the app understands. */
export function toStorageFailure(error: unknown): StorageFailure {
  if (error instanceof StorageFailure) {
    return error;
  }
  return new StorageFailure(isQuotaError(error) ? "storage-full" : "storage-failed", error);
}
