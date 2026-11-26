import type { StoragePersistence } from "@core/library/storage-persistence.ts";

/** Counts how often persistence was requested, without touching the browser. */
export class RecordingStoragePersistence implements StoragePersistence {
  requests = 0;

  async request(): Promise<boolean> {
    this.requests += 1;
    return true;
  }
}
