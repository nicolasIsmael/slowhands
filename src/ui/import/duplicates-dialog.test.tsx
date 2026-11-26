import type { DuplicateNotice } from "@core/import/duplicate-decision.ts";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { DuplicatesDialog } from "./duplicates-dialog.tsx";

const notices: DuplicateNotice[] = [
  { fileIndex: 0, fileName: "etude.musicxml", existingName: "Etude", reason: "same-content" },
  {
    fileIndex: 2,
    fileName: "etude.musicxml",
    existingName: "Etude Op. 10",
    reason: "same-identity",
  },
];

function show(language: "en" | "es" = "en", list: DuplicateNotice[] = notices) {
  const onDecide = vi.fn();
  renderWithProviders(<DuplicatesDialog notices={list} onDecide={onDecide} />, { language });
  return onDecide;
}

test("lists every duplicate once, with the song it matches", () => {
  show();
  expect(screen.getByRole("dialog", { name: "2 songs are already in your library" })).toBeTruthy();
  expect(screen.getAllByText("etude.musicxml")).toHaveLength(2);
  expect(screen.getByText("Same score as “Etude”")).toBeTruthy();
  expect(screen.getByText("Looks like “Etude Op. 10”")).toBeTruthy();
});

test("speaks about a single song in the singular", () => {
  show("en", notices.slice(0, 1));
  expect(screen.getByRole("dialog", { name: "This song is already in your library" })).toBeTruthy();
});

test.each([
  ["Replace existing", "replace-all"],
  ["Keep both", "keep-both-all"],
  ["Skip duplicates", "skip-all"],
])("choosing %s answers once for all the duplicates", async (label, decision) => {
  const onDecide = show();
  await userEvent.click(screen.getByRole("button", { name: label }));
  expect(onDecide).toHaveBeenCalledExactlyOnceWith(decision);
});

test("closing the notice with the keyboard counts as skipping", async () => {
  const onDecide = show();
  await userEvent.keyboard("{Escape}");
  expect(onDecide).toHaveBeenCalledWith("skip-all");
});

test("a click outside the notice does not decide anything", async () => {
  const onDecide = show();
  const overlay = document.querySelector("[data-slot=dialog-overlay]") as Element;
  fireEvent.pointerDown(overlay);
  fireEvent.click(overlay);
  expect(onDecide).not.toHaveBeenCalled();
});

test("speaks Spanish when the interface is Spanish", () => {
  show("es");
  expect(
    screen.getByRole("dialog", { name: "2 canciones ya están en tu biblioteca" }),
  ).toBeTruthy();
  expect(screen.getByRole("button", { name: "Reemplazar existentes" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Conservar ambas" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Omitir duplicadas" })).toBeTruthy();
});
