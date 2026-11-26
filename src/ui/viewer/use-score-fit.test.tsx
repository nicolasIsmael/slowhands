import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { RecordingScoreRenderer } from "../testing/recording-score-renderer.ts";
import { RESIZE_SETTLE_MS, useScoreFit } from "./use-score-fit.ts";

class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  disconnected = false;
  private readonly callback: () => void;

  constructor(callback: () => void) {
    this.callback = callback;
    FakeResizeObserver.instances.push(this);
  }

  observe(): void {}

  disconnect(): void {
    this.disconnected = true;
  }

  fire(): void {
    this.callback();
  }
}

function surfaceOfWidth(width: number) {
  const element = document.createElement("div");
  let current = width;
  Object.defineProperty(element, "clientWidth", { get: () => current });
  const resizeTo = (next: number): void => {
    current = next;
  };
  return { element, resizeTo };
}

beforeEach(() => {
  FakeResizeObserver.instances = [];
  vi.useFakeTimers();
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function setup(enabled = true) {
  const surface = surfaceOfWidth(360);
  const renderer = new RecordingScoreRenderer();
  const hook = renderHook(() =>
    useScoreFit({ current: surface.element }, { current: renderer }, enabled),
  );
  return { surface, renderer, hook, observer: FakeResizeObserver.instances[0] };
}

test("lays the score out again once the width has settled on a new value", () => {
  const { surface, renderer, observer } = setup();
  surface.resizeTo(800);
  observer?.fire();
  expect(renderer.refits).toBe(0);
  vi.advanceTimersByTime(RESIZE_SETTLE_MS);
  expect(renderer.refits).toBe(1);
});

test("waits for a burst of resizes to end before laying out once", () => {
  const { surface, renderer, observer } = setup();
  for (const width of [400, 500, 600, 700]) {
    surface.resizeTo(width);
    observer?.fire();
    vi.advanceTimersByTime(RESIZE_SETTLE_MS / 3);
  }
  vi.advanceTimersByTime(RESIZE_SETTLE_MS);
  expect(renderer.refits).toBe(1);
});

test("does nothing when the width is the same as before", () => {
  const { renderer, observer } = setup();
  observer?.fire();
  vi.advanceTimersByTime(RESIZE_SETTLE_MS);
  expect(renderer.refits).toBe(0);
});

test("does not watch the surface until the score is ready", () => {
  setup(false);
  expect(FakeResizeObserver.instances).toHaveLength(0);
});

test("stops watching when the screen goes away", () => {
  const { hook, observer } = setup();
  hook.unmount();
  expect(observer?.disconnected).toBe(true);
});
