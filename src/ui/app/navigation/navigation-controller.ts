import { LIST_VIEW, type View, viewFromHistoryState } from "./view.ts";

/**
 * Tracks which screen is shown. The address never changes: the viewer is a history entry
 * that only carries state, so the back button returns to the list, while a fresh start
 * always shows the list because the state is cleared on construction.
 */
export class NavigationController {
  private view: View = LIST_VIEW;
  private readonly listeners = new Set<() => void>();

  constructor() {
    window.history.replaceState(null, "");
    window.addEventListener("popstate", this.handlePopState);
  }

  current = (): View => this.view;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  openViewer(songId: string): void {
    window.history.pushState({ name: "viewer", songId }, "");
    this.change({ name: "viewer", songId });
  }

  showList(): void {
    if (this.view.name === "viewer") {
      window.history.back();
    }
  }

  dispose(): void {
    window.removeEventListener("popstate", this.handlePopState);
    this.listeners.clear();
  }

  private handlePopState = (event: PopStateEvent): void => {
    this.change(viewFromHistoryState(event.state));
  };

  private change(next: View): void {
    this.view = next;
    for (const listener of this.listeners) {
      listener();
    }
  }
}
