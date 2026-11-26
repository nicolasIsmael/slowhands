import type { DuplicateDecision } from "@core/import/duplicate-decision.ts";
import type { FileResult } from "@core/import/import-outcome.ts";
import type { ImportRunner } from "@core/import/import-runner.ts";
import { ImportSummary } from "@core/import/import-summary.ts";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { NavigationController } from "../app/navigation/navigation-controller.ts";
import { RecordingStoragePersistence } from "../testing/recording-storage-persistence.ts";
import { renderWithProviders } from "../testing/render-with-providers.tsx";
import { SongListScreen } from "./song-list-screen.tsx";

/** A runner with one duplicate file that ends up as whatever the person's choice leads to. */
function runnerWithOneDuplicate(
  resultFor: (decision: DuplicateDecision) => FileResult,
  decisions: DuplicateDecision[],
): () => ImportRunner {
  return () => ({
    run: async (files, onProgress, decideDuplicates) => {
      const [file] = files;
      const fileName = file?.name ?? "etude.musicxml";
      const progress = { fileIndex: 0, fileCount: 1, fileName };
      onProgress({ ...progress, step: "duplicate" });
      const decision = await decideDuplicates([
        { fileIndex: 0, fileName, existingName: "Etude", reason: "same-content" },
      ]);
      decisions.push(decision);
      const result = resultFor(decision);
      onProgress({ ...progress, step: "done", result });
      return new ImportSummary([{ fileName, result }]);
    },
  });
}

const pickEtude = () =>
  userEvent.upload(screen.getByLabelText("Import scores"), [new File(["x"], "etude.musicxml")]);

test("asks about the duplicates, and the choice decides the summary", async () => {
  const decisions: DuplicateDecision[] = [];
  renderWithProviders(<SongListScreen />, {
    services: {
      createBatchImport: runnerWithOneDuplicate(
        (decision) =>
          decision === "keep-both-all" ? { kind: "kept-both", songId: "2" } : { kind: "skipped" },
        decisions,
      ),
    },
  });
  await pickEtude();
  await userEvent.click(await screen.findByRole("button", { name: "Keep both" }));
  expect(await screen.findByRole("dialog", { name: "Import finished" })).toBeTruthy();
  expect(screen.getByText("1 song kept next to the existing one")).toBeTruthy();
  expect(decisions).toEqual(["keep-both-all"]);
});

test("skipping is listed in the summary as a skipped duplicate", async () => {
  renderWithProviders(<SongListScreen />, {
    services: {
      createBatchImport: runnerWithOneDuplicate(() => ({ kind: "skipped" }), []),
    },
  });
  await pickEtude();
  await userEvent.click(await screen.findByRole("button", { name: "Skip duplicates" }));
  expect(await screen.findByText("1 duplicate skipped")).toBeTruthy();
  expect(screen.getByText("Skipped (already in your library)")).toBeTruthy();
});

test("closing the notice counts as skipping", async () => {
  const decisions: DuplicateDecision[] = [];
  renderWithProviders(<SongListScreen />, {
    services: { createBatchImport: runnerWithOneDuplicate(() => ({ kind: "skipped" }), decisions) },
  });
  await pickEtude();
  await screen.findByRole("dialog", { name: "This song is already in your library" });
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(decisions).toEqual(["skip-all"]));
});

test("a single replaced song opens in the viewer", async () => {
  const navigation = new NavigationController();
  renderWithProviders(<SongListScreen />, {
    services: {
      navigation,
      createBatchImport: runnerWithOneDuplicate(() => ({ kind: "replaced", songId: "7" }), []),
    },
  });
  await pickEtude();
  await userEvent.click(await screen.findByRole("button", { name: "Replace existing" }));
  await waitFor(() => expect(navigation.current()).toEqual({ name: "viewer", songId: "7" }));
});

test("the import button waits while the question is open", async () => {
  renderWithProviders(<SongListScreen />, {
    services: { createBatchImport: runnerWithOneDuplicate(() => ({ kind: "skipped" }), []) },
  });
  await pickEtude();
  await screen.findByRole("dialog", { name: "This song is already in your library" });
  expect(screen.getByLabelText("Import scores")).toHaveProperty("disabled", true);
});

test("asks the device to keep the library after a replacement", async () => {
  const persistence = new RecordingStoragePersistence();
  renderWithProviders(<SongListScreen />, {
    services: {
      storagePersistence: persistence,
      createBatchImport: runnerWithOneDuplicate(() => ({ kind: "kept-both", songId: "2" }), []),
    },
  });
  await pickEtude();
  await userEvent.click(await screen.findByRole("button", { name: "Keep both" }));
  await waitFor(() => expect(persistence.requests).toBe(1));
});
