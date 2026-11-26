import { act, renderHook } from "@testing-library/react";
import { expect, test } from "vitest";
import { RecordingScoreRenderer } from "../testing/recording-score-renderer.ts";
import { useZoom } from "./use-zoom.ts";

function setup() {
  const renderer = new RecordingScoreRenderer();
  const ref = { current: renderer };
  return { renderer, hook: renderHook(() => useZoom(ref)) };
}

test("starts fitted to the width", () => {
  expect(setup().hook.result.current.level.isFit).toBe(true);
});

test("zooming in changes the level and tells the renderer", () => {
  const { hook, renderer } = setup();
  act(() => hook.result.current.zoomIn());
  expect(hook.result.current.level.factor).toBe(1.25);
  expect(renderer.zooms).toEqual([1.25]);
});

test("zooming out and fitting again are applied the same way", () => {
  const { hook, renderer } = setup();
  act(() => hook.result.current.zoomOut());
  act(() => hook.result.current.fit());
  expect(renderer.zooms).toEqual([0.75, 1]);
  expect(hook.result.current.level.isFit).toBe(true);
});

test("keeps working when no renderer is drawing yet", () => {
  const hook = renderHook(() => useZoom({ current: null }));
  act(() => hook.result.current.zoomIn());
  expect(hook.result.current.level.factor).toBe(1.25);
});
