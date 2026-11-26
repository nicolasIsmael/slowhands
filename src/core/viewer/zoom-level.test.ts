import { expect, test } from "vitest";
import { MAX_ZOOM, MIN_ZOOM, ZoomLevel } from "./zoom-level.ts";

test("starts fitted to the width, which is a factor of 1", () => {
  expect(ZoomLevel.fit().factor).toBe(1);
  expect(ZoomLevel.fit().isFit).toBe(true);
});

test("zooming in and out moves in steps of a quarter", () => {
  expect(ZoomLevel.fit().zoomIn().factor).toBe(1.25);
  expect(ZoomLevel.fit().zoomOut().factor).toBe(0.75);
});

test("never zooms in beyond the largest size", () => {
  let level = ZoomLevel.fit();
  for (let step = 0; step < 20; step += 1) {
    level = level.zoomIn();
  }
  expect(level.factor).toBe(MAX_ZOOM);
  expect(level.canZoomIn).toBe(false);
  expect(level.canZoomOut).toBe(true);
});

test("never zooms out beyond the smallest size", () => {
  let level = ZoomLevel.fit();
  for (let step = 0; step < 20; step += 1) {
    level = level.zoomOut();
  }
  expect(level.factor).toBe(MIN_ZOOM);
  expect(level.canZoomOut).toBe(false);
  expect(level.canZoomIn).toBe(true);
});

test("fitting again returns to a factor of 1 from any size", () => {
  expect(ZoomLevel.fit().zoomIn().zoomIn().toFit().isFit).toBe(true);
  expect(ZoomLevel.fit().zoomOut().toFit().factor).toBe(1);
});

test("reports its size as a whole percentage", () => {
  expect(ZoomLevel.fit().zoomIn().percent).toBe(125);
  expect(ZoomLevel.fit().zoomOut().zoomOut().percent).toBe(50);
});

test("never changes the level it was called on", () => {
  const level = ZoomLevel.fit();
  level.zoomIn();
  expect(level.factor).toBe(1);
});
