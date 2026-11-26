import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { ImportProgressList } from "./import-progress-list.tsx";
import type { ImportRow } from "./import-state.ts";

const row = (
  position: number,
  fileName: string,
  overrides: Partial<ImportRow> = {},
): ImportRow => ({
  position,
  fileName,
  step: "waiting",
  result: null,
  ...overrides,
});

test("shows where each file is: waiting, checking or saving", () => {
  const rows = [
    row(0, "a.musicxml"),
    row(1, "b.musicxml", { step: "checking" }),
    row(2, "c.musicxml", { step: "saving" }),
  ];
  renderWithProviders(<ImportProgressList rows={rows} />);
  expect(screen.getByText("Waiting")).toBeTruthy();
  expect(screen.getByText("Checking…")).toBeTruthy();
  expect(screen.getByText("Saving…")).toBeTruthy();
});

test("marks an imported file as imported", () => {
  const rows = [row(0, "a.musicxml", { step: "done", result: { kind: "imported", songId: "1" } })];
  renderWithProviders(<ImportProgressList rows={rows} />);
  expect(screen.getByText("Imported")).toBeTruthy();
});

test("explains a failed file with what went wrong and what to do", () => {
  const rows = [
    row(0, "a.pdf", { step: "done", result: { kind: "failed", code: "unsupported-file-type" } }),
  ];
  renderWithProviders(<ImportProgressList rows={rows} />);
  expect(screen.getByText("This file type is not supported yet")).toBeTruthy();
  expect(screen.getByText("Choose a MusicXML file (.musicxml, .xml or .mxl).")).toBeTruthy();
});

test("names the size limit when a file is too large", () => {
  const rows = [
    row(0, "big.musicxml", { step: "done", result: { kind: "failed", code: "file-too-large" } }),
  ];
  renderWithProviders(<ImportProgressList rows={rows} />);
  expect(screen.getByText("Files can be up to 20 MB. Try a smaller file.")).toBeTruthy();
});

test("explains failures in Spanish when the interface is Spanish", () => {
  const rows = [
    row(0, "a.xml", { step: "done", result: { kind: "failed", code: "xml-malformed" } }),
  ];
  renderWithProviders(<ImportProgressList rows={rows} />, { language: "es" });
  expect(screen.getByText("El archivo está dañado o incompleto")).toBeTruthy();
});

test("lists two files with the same name as two separate rows", () => {
  const rows = [row(0, "same.musicxml"), row(1, "same.musicxml")];
  renderWithProviders(<ImportProgressList rows={rows} />);
  expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(2);
});

test("shows names with accents, non-Latin characters and emoji as they are", () => {
  renderWithProviders(<ImportProgressList rows={[row(0, "Café ñandú 山田 🎹.musicxml")]} />);
  expect(screen.getByText("Café ñandú 山田 🎹.musicxml")).toBeTruthy();
});
