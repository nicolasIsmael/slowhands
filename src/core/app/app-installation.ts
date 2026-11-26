import type { Subscribable } from "../reactive/subscribable.ts";

/** Putting the app on the device's home screen, where the browser offers to. */
export interface AppInstallation {
  /** Emits `true` while the browser is ready to install the app, and `false` otherwise. */
  readonly canInstall: Subscribable<boolean>;
  /** Asks the browser to show its install question. */
  install(): Promise<void>;
}
