import { ZoomLevel } from "@core/viewer/zoom-level.ts";
import { fireEvent, renderHook } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import type { ZoomControl } from "./use-zoom.ts";
import { useZoomKeys } from "./use-zoom-keys.ts";

function setup(enabled = true): ZoomControl {
  const zoom: ZoomControl = {
    level: ZoomLevel.fit(),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    fit: vi.fn(),
  };
  renderHook(() => useZoomKeys(zoom, enabled));
  return zoom;
}

test("plus zooms in, minus zooms out and zero fits the width", () => {
  const zoom = setup();
  fireEvent.keyDown(window, { key: "+" });
  fireEvent.keyDown(window, { key: "=" });
  fireEvent.keyDown(window, { key: "-" });
  fireEvent.keyDown(window, { key: "0" });
  expect(vi.mocked(zoom.zoomIn)).toHaveBeenCalledTimes(2);
  expect(vi.mocked(zoom.zoomOut)).toHaveBeenCalledTimes(1);
  expect(vi.mocked(zoom.fit)).toHaveBeenCalledTimes(1);
});

test("leaves the keys alone while the person is typing in a field", () => {
  const zoom = setup();
  const field = document.createElement("input");
  document.body.append(field);
  fireEvent.keyDown(field, { key: "+" });
  field.remove();
  expect(vi.mocked(zoom.zoomIn)).not.toHaveBeenCalled();
});

test("leaves the browser zoom shortcuts alone", () => {
  const zoom = setup();
  fireEvent.keyDown(window, { key: "+", ctrlKey: true });
  fireEvent.keyDown(window, { key: "-", metaKey: true });
  expect(vi.mocked(zoom.zoomIn)).not.toHaveBeenCalled();
  expect(vi.mocked(zoom.zoomOut)).not.toHaveBeenCalled();
});

test("does nothing while it is disabled", () => {
  const zoom = setup(false);
  fireEvent.keyDown(window, { key: "+" });
  expect(vi.mocked(zoom.zoomIn)).not.toHaveBeenCalled();
});
