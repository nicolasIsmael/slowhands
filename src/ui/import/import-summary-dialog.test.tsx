import { ImportSummary } from "@core/import/import-summary.ts";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import type { ImportRow, ImportState } from "./import-state.ts";
import { ImportSummaryDialog } from "./import-summary-dialog.tsx";

const imported = { kind: "imported", songId: "1" } as const;
const failed = { kind: "failed", code: "not-a-score" } as const;

const rows: ImportRow[] = [
  { position: 0, fileName: "a.musicxml", step: "done", result: imported },
  { position: 1, fileName: "b.xml", step: "done", result: failed },
];

const running: ImportState = {
  status: "running",
  rows: [rows[0] as ImportRow, { position: 1, fileName: "b.xml", step: "checking", result: null }],
};

const finished = (summaryRows: ImportRow[] = rows): ImportState => ({
  status: "finished",
  rows: summaryRows,
  summary: new ImportSummary(
    summaryRows.flatMap((r) => (r.result ? [{ fileName: r.fileName, result: r.result }] : [])),
  ),
});

test("shows nothing when no import is happening", () => {
  renderWithProviders(<ImportSummaryDialog state={{ status: "idle" }} onClose={() => {}} />);
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("shows progress while files are being imported, without a way to close", () => {
  renderWithProviders(<ImportSummaryDialog state={running} onClose={() => {}} />);
  expect(screen.getByRole("dialog", { name: "Importing scores" })).toBeTruthy();
  expect(screen.getByText("1 of 2")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
});

test("shows one summary with the counts and every file's result", () => {
  renderWithProviders(<ImportSummaryDialog state={finished()} onClose={() => {}} />);
  expect(screen.getByRole("dialog", { name: "Import finished" })).toBeTruthy();
  expect(screen.getByText("1 song imported · 1 file could not be imported")).toBeTruthy();
  expect(screen.getByText("This is not a MusicXML score")).toBeTruthy();
});

test("leaves out a count that is zero", () => {
  renderWithProviders(
    <ImportSummaryDialog state={finished([rows[0] as ImportRow])} onClose={() => {}} />,
  );
  expect(screen.getByText("1 song imported")).toBeTruthy();
  expect(screen.queryByText(/could not be imported/)).toBeNull();
});

test("closes only when the person chooses to", async () => {
  const onClose = vi.fn();
  renderWithProviders(<ImportSummaryDialog state={finished()} onClose={onClose} />);
  await userEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("can be dismissed with the keyboard once it is finished", async () => {
  const onClose = vi.fn();
  renderWithProviders(<ImportSummaryDialog state={finished()} onClose={onClose} />);
  await userEvent.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalled();
});

test("ignores the keyboard while the import is still running", async () => {
  const onClose = vi.fn();
  renderWithProviders(<ImportSummaryDialog state={running} onClose={onClose} />);
  await userEvent.keyboard("{Escape}");
  expect(onClose).not.toHaveBeenCalled();
});

test("speaks Spanish, with Spanish plural forms, when the interface is Spanish", () => {
  const many: ImportRow[] = Array.from({ length: 2 }, (_, position) => ({
    position,
    fileName: `${position}.xml`,
    step: "done",
    result: imported,
  }));
  renderWithProviders(<ImportSummaryDialog state={finished(many)} onClose={() => {}} />, {
    language: "es",
  });
  expect(screen.getByText("2 canciones importadas")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Cerrar" })).toBeTruthy();
});

test("says what happened to a replaced, a kept and a skipped duplicate", () => {
  const results = [
    { kind: "replaced", songId: "1" },
    { kind: "kept-both", songId: "2" },
    { kind: "skipped" },
  ] as const;
  const duplicates: ImportRow[] = results.map((result, position) => ({
    position,
    fileName: `${position}.xml`,
    step: "done",
    result,
  }));
  renderWithProviders(<ImportSummaryDialog state={finished(duplicates)} onClose={() => {}} />);
  expect(
    screen.getByText(
      "1 song replaced · 1 song kept next to the existing one · 1 duplicate skipped",
    ),
  ).toBeTruthy();
  expect(screen.getByText("Replaced")).toBeTruthy();
  expect(screen.getByText("Kept next to the existing song")).toBeTruthy();
  expect(screen.getByText("Skipped (already in your library)")).toBeTruthy();
});

test("shows a file waiting for the decision as already in the library", () => {
  const waiting: ImportState = {
    status: "running",
    rows: [{ position: 0, fileName: "a.xml", step: "duplicate", result: null }],
  };
  renderWithProviders(<ImportSummaryDialog state={waiting} onClose={() => {}} />);
  expect(screen.getByText("Already in your library")).toBeTruthy();
});
