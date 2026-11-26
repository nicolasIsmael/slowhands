import type { Subscribable } from "../reactive/subscribable.ts";

/**
 * Tells when another tab upgraded the library's storage, after which this tab has closed its own
 * connection and must be reloaded before it can read or write songs again.
 */
export interface StorageSupersession {
  /** Emits `true` once the storage was upgraded elsewhere, and `false` before that. */
  readonly superseded: Subscribable<boolean>;
}
