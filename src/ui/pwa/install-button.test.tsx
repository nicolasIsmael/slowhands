import { Flag } from "@core/reactive/flag.ts";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { InstallButton } from "./install-button.tsx";

function show(language: "en" | "es" = "en") {
  const ready = new Flag();
  const install = vi.fn(async () => {});
  renderWithProviders(<InstallButton />, {
    language,
    services: { installation: { canInstall: ready, install } },
  });
  return { ready, install };
}

test("shows nothing while the browser offers no installation", () => {
  show();
  expect(screen.queryByRole("button")).toBeNull();
});

test("appears once the browser can install the app", () => {
  const { ready } = show();
  act(() => ready.raise());
  expect(screen.getByRole("button", { name: "Install app" })).toBeTruthy();
});

test("asks the browser to install only when the person chooses to", async () => {
  const { ready, install } = show();
  act(() => ready.raise());
  expect(install).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Install app" }));
  expect(install).toHaveBeenCalledTimes(1);
});

test("disappears once the app is installed", () => {
  const { ready } = show();
  act(() => ready.raise());
  act(() => ready.lower());
  expect(screen.queryByRole("button")).toBeNull();
});

test("speaks Spanish when the interface is Spanish", () => {
  const { ready } = show("es");
  act(() => ready.raise());
  expect(screen.getByRole("button", { name: "Instalar aplicación" })).toBeTruthy();
});
