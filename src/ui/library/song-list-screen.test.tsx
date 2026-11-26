import type { ImportRunner } from "@core/import/import-runner.ts";
import { ImportSummary } from "@core/import/import-summary.ts";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { NavigationController } from "../app/navigation/navigation-controller.ts";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { SongListScreen } from "./song-list-screen.tsx";

const runnerReturning =
  (summary: ImportSummary): (() => ImportRunner) =>
  () => ({
    run: async (files, onProgress) => {
      for (const [fileIndex, file] of files.entries()) {
        const fileCount = files.length;
        onProgress({ fileIndex, fileCount, fileName: file.name, step: "checking" });
        const result = summary.outcomes[fileIndex]?.result;
        onProgress({
          fileIndex,
          fileCount,
          fileName: file.name,
          step: "done",
          ...(result && { result }),
        });
      }
      return summary;
    },
  });

const pick = (...names: string[]) =>
  userEvent.upload(
    screen.getByLabelText("Import scores"),
    names.map((name) => new File(["x"], name)),
  );

test("shows the title, the import button and a hint while the library is empty", () => {
  renderWithProviders(<SongListScreen />);
  expect(screen.getByRole("heading", { name: "Songs" })).toBeTruthy();
  expect(screen.getByLabelText("Import scores")).toBeTruthy();
  expect(screen.getByText("No songs yet")).toBeTruthy();
});

test("shows the one summary after a batch with a failed file", async () => {
  const summary = new ImportSummary([
    { fileName: "a.musicxml", result: { kind: "imported", songId: "1" } },
    { fileName: "b.pdf", result: { kind: "failed", code: "unsupported-file-type" } },
  ]);
  renderWithProviders(<SongListScreen />, {
    services: { createBatchImport: runnerReturning(summary) },
  });
  await pick("a.musicxml", "b.pdf");
  expect(await screen.findByRole("dialog", { name: "Import finished" })).toBeTruthy();
  expect(screen.getByText("This file type is not supported yet")).toBeTruthy();
});

test("closing the summary returns to the list", async () => {
  const summary = new ImportSummary([
    { fileName: "b.pdf", result: { kind: "failed", code: "unsupported-file-type" } },
  ]);
  renderWithProviders(<SongListScreen />, {
    services: { createBatchImport: runnerReturning(summary) },
  });
  await pick("b.pdf");
  await userEvent.click(await screen.findByRole("button", { name: "Close" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

test("opens the song at once when a single file was imported", async () => {
  const summary = new ImportSummary([
    { fileName: "a.musicxml", result: { kind: "imported", songId: "song-9" } },
  ]);
  const navigation = new NavigationController();
  renderWithProviders(<SongListScreen />, {
    services: { createBatchImport: runnerReturning(summary), navigation },
  });
  await pick("a.musicxml");
  await waitFor(() => expect(navigation.current()).toEqual({ name: "viewer", songId: "song-9" }));
  expect(screen.queryByRole("dialog")).toBeNull();
});

test("does not offer a second import while one is running", async () => {
  let release: (summary: ImportSummary) => void = () => {};
  const pending = new Promise<ImportSummary>((resolve) => {
    release = resolve;
  });
  renderWithProviders(<SongListScreen />, {
    services: { createBatchImport: () => ({ run: () => pending }) },
  });
  await pick("a.musicxml");
  await waitFor(() =>
    expect(screen.getByLabelText("Import scores")).toHaveProperty("disabled", true),
  );
  release(new ImportSummary([]));
});
