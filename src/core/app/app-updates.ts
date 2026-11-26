import type { Subscribable } from "../reactive/subscribable.ts";

/** A new version of the app that is ready to take over. It is offered, never forced. */
export interface AppUpdates {
  /** Emits `true` once a new version is waiting, and `false` while there is none. */
  readonly available: Subscribable<boolean>;
  /** Activates the waiting version and reloads the page. */
  apply(): Promise<void>;
}
