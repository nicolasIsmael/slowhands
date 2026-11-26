import type { AppInstallation } from "@core/app/app-installation.ts";
import { Flag } from "@core/reactive/flag.ts";
import type { Subscribable } from "@core/reactive/subscribable.ts";

/** The browser's install offer, which Chrome on Android raises as `beforeinstallprompt`. */
interface InstallOffer extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<unknown>;
}

/**
 * Keeps the browser's install offer until the person asks for it. Browsers that never raise the
 * offer leave `canInstall` false, so nothing is shown there.
 */
export class BrowserAppInstallation implements AppInstallation {
  readonly canInstall: Subscribable<boolean>;
  private readonly ready = new Flag();
  private offer: InstallOffer | null = null;

  constructor(target: EventTarget) {
    this.canInstall = this.ready;
    target.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      this.offer = event as InstallOffer;
      this.ready.raise();
    });
    target.addEventListener("appinstalled", () => this.forgetOffer());
  }

  async install(): Promise<void> {
    const offer = this.offer;
    if (offer === null) {
      return;
    }
    // An offer can be used once; the browser raises a new one if installing is still possible.
    this.forgetOffer();
    await offer.prompt();
    await offer.userChoice.catch(() => undefined);
  }

  private forgetOffer(): void {
    this.offer = null;
    this.ready.lower();
  }
}
