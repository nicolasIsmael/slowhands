import type { StoragePersistence } from "@core/library/storage-persistence.ts";

/** Uses the browser's persistent-storage request, which only affects whether data may be evicted. */
export class BrowserStoragePersistence implements StoragePersistence {
  async request(): Promise<boolean> {
    try {
      return (await navigator.storage?.persist?.()) ?? false;
    } catch {
      return false;
    }
  }
}
