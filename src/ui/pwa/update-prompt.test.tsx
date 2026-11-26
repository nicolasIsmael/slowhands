import type { AppUpdates } from "@core/app/app-updates.ts";
import { Flag } from "@core/reactive/flag.ts";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ImportActivity } from "../import/import-activity.ts";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { UpdatePrompt } from "./update-prompt.tsx";

function show(language: "en" | "es" = "en") {
  const waiting = new Flag();
  const activity = new ImportActivity();
  const apply = vi.fn(async () => {});
  const updates: AppUpdates = { available: waiting, apply };
  renderWithProviders(<UpdatePrompt />, {
    language,
    services: { updates, importActivity: activity },
  });
  return { waiting, activity, apply };
}

test("shows nothing while there is no new version", () => {
  show();
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.queryByRole("button")).toBeNull();
});

test("offers the update once a new version is waiting", () => {
  const { waiting } = show();
  act(() => waiting.raise());
  expect(screen.getByRole("status").textContent).toContain("A new version of SlowHands is ready.");
  expect(screen.getByRole("button", { name: "Update now" })).toHaveProperty("disabled", false);
});

test("applies the update only when the person asks", async () => {
  const { waiting, apply } = show();
  act(() => waiting.raise());
  expect(apply).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Update now" }));
  expect(apply).toHaveBeenCalledTimes(1);
});

test("cannot be applied while an import runs, and says why", () => {
  const { waiting, activity } = show();
  act(() => waiting.raise());
  act(() => activity.begin());
  expect(screen.getByRole("button", { name: "Update now" })).toHaveProperty("disabled", true);
  expect(screen.getByText("It can be applied when the import finishes.")).toBeTruthy();
});

test("can be applied again once the import is over", () => {
  const { waiting, activity } = show();
  act(() => waiting.raise());
  act(() => activity.begin());
  act(() => activity.end());
  expect(screen.getByRole("button", { name: "Update now" })).toHaveProperty("disabled", false);
  expect(screen.queryByText("It can be applied when the import finishes.")).toBeNull();
});

test("speaks Spanish when the interface is Spanish", () => {
  const { waiting } = show("es");
  act(() => waiting.raise());
  expect(screen.getByRole("button", { name: "Actualizar ahora" })).toBeTruthy();
});
