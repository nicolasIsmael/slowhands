import type { AppUpdates } from "@core/app/app-updates.ts";
import { Flag } from "@core/reactive/flag.ts";
import type { Subscribable } from "@core/reactive/subscribable.ts";

/** The shape of the registration function that the build tool provides to the app. */
export type RegisterWorker = (options: {
  onNeedRefresh: () => void;
}) => (reloadPage?: boolean) => Promise<void>;

/** Offers new versions of the app, which the service worker downloads and keeps waiting. */
export class ServiceWorkerUpdates implements AppUpdates {
  readonly available: Subscribable<boolean>;
  private readonly waiting = new Flag();
  private readonly activate: (reloadPage?: boolean) => Promise<void>;

  constructor(register: RegisterWorker) {
    this.available = this.waiting;
    this.activate = register({ onNeedRefresh: () => this.waiting.raise() });
  }

  apply(): Promise<void> {
    return this.activate(true);
  }
}
