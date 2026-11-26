/**
 * Tells the rest of the app whether an import is under way, so that things which reload the page
 * (such as applying an update) wait until the batch is over.
 */
export class ImportActivity {
  private running = 0;
  private readonly listeners = new Set<() => void>();

  begin(): void {
    this.running += 1;
    this.announce();
  }

  end(): void {
    this.running = Math.max(0, this.running - 1);
    this.announce();
  }

  readonly isBusy = (): boolean => this.running > 0;

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private announce(): void {
    for (const listener of [...this.listeners]) {
      listener();
    }
  }
}
