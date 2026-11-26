import type { Subscribable, Unsubscribe } from "./subscribable.ts";

/** A yes/no fact that starts as `false` and changes when it is `raise`d or `lower`ed. */
export class Flag implements Subscribable<boolean> {
  private value = false;
  private readonly listeners = new Set<(value: boolean) => void>();

  raise(): void {
    this.change(true);
  }

  lower(): void {
    this.change(false);
  }

  subscribe(onValue: (value: boolean) => void): Unsubscribe {
    this.listeners.add(onValue);
    onValue(this.value);
    return () => {
      this.listeners.delete(onValue);
    };
  }

  private change(next: boolean): void {
    if (this.value === next) {
      return;
    }
    this.value = next;
    for (const listener of [...this.listeners]) {
      listener(next);
    }
  }
}
