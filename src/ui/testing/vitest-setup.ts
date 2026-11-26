import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/** jsdom has no layout, so a resize observer has nothing to report; tests that need one install their own. */
class SilentResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (typeof globalThis.ResizeObserver === "undefined") {
  Object.defineProperty(globalThis, "ResizeObserver", {
    value: SilentResizeObserver,
    configurable: true,
  });
}

afterEach(() => {
  cleanup();
});
