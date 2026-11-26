import type { Clock } from "@core/time/clock.ts";

export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }
}
