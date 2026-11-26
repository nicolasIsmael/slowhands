import { ZoomLevel } from "@core/viewer/zoom-level.ts";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import type { ZoomControl } from "./use-zoom.ts";
import { ZoomControls } from "./zoom-controls.tsx";

const control = (level = ZoomLevel.fit()): ZoomControl => ({
  level,
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  fit: vi.fn(),
});

const zoomedIn = (): ZoomLevel => ZoomLevel.fit().zoomIn();

test("offers labeled buttons to zoom in, zoom out and fit the width", () => {
  renderWithProviders(<ZoomControls zoom={control(zoomedIn())} />);
  expect(screen.getByRole("button", { name: "Zoom in" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Zoom out" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Fit to width" })).toBeTruthy();
  expect(screen.getByRole("group", { name: "Zoom" })).toBeTruthy();
});

test("shows the current size as a percentage", () => {
  renderWithProviders(<ZoomControls zoom={control(zoomedIn())} />);
  expect(screen.getByText("125%")).toBeTruthy();
});

test("each button asks for its own change", async () => {
  const zoom = control(zoomedIn());
  renderWithProviders(<ZoomControls zoom={zoom} />);
  await userEvent.click(screen.getByRole("button", { name: "Zoom in" }));
  await userEvent.click(screen.getByRole("button", { name: "Zoom out" }));
  await userEvent.click(screen.getByRole("button", { name: "Fit to width" }));
  const calls = [zoom.zoomIn, zoom.zoomOut, zoom.fit].map((fn) => vi.mocked(fn).mock.calls.length);
  expect(calls).toEqual([1, 1, 1]);
});

test("cannot zoom in further at the largest size", () => {
  let largest = ZoomLevel.fit();
  for (let step = 0; step < 20; step += 1) {
    largest = largest.zoomIn();
  }
  renderWithProviders(<ZoomControls zoom={control(largest)} />);
  expect(screen.getByRole("button", { name: "Zoom in" })).toHaveProperty("disabled", true);
});

test("cannot zoom out further at the smallest size", () => {
  let smallest = ZoomLevel.fit();
  for (let step = 0; step < 20; step += 1) {
    smallest = smallest.zoomOut();
  }
  renderWithProviders(<ZoomControls zoom={control(smallest)} />);
  expect(screen.getByRole("button", { name: "Zoom out" })).toHaveProperty("disabled", true);
});

test("has nothing to fit when the score already fits the width", () => {
  renderWithProviders(<ZoomControls zoom={control()} />);
  expect(screen.getByRole("button", { name: "Fit to width" })).toHaveProperty("disabled", true);
});

test("is labeled in Spanish when the interface is Spanish", () => {
  renderWithProviders(<ZoomControls zoom={control(zoomedIn())} />, { language: "es" });
  expect(screen.getByRole("button", { name: "Acercar" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Ajustar al ancho" })).toBeTruthy();
});
