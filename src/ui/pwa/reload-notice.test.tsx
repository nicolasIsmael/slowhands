import { Flag } from "@core/reactive/flag.ts";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { ReloadNotice } from "./reload-notice.tsx";

function show(language: "en" | "es" = "en") {
  const upgraded = new Flag();
  const reloadPage = vi.fn();
  renderWithProviders(<ReloadNotice />, {
    language,
    services: { supersession: { superseded: upgraded }, reloadPage },
  });
  return { upgraded, reloadPage };
}

test("shows nothing while the storage is current", () => {
  show();
  expect(screen.queryByRole("alert")).toBeNull();
});

test("asks for a reload once another tab upgraded the storage", () => {
  const { upgraded } = show();
  act(() => upgraded.raise());
  expect(screen.getByRole("alert").textContent).toContain("Reload this page to keep working.");
});

test("reloads the page when the person chooses to", async () => {
  const { upgraded, reloadPage } = show();
  act(() => upgraded.raise());
  await userEvent.click(screen.getByRole("button", { name: "Reload" }));
  expect(reloadPage).toHaveBeenCalledTimes(1);
});

test("speaks Spanish when the interface is Spanish", () => {
  const { upgraded } = show("es");
  act(() => upgraded.raise());
  expect(screen.getByRole("button", { name: "Recargar" })).toBeTruthy();
});
