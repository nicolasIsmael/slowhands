import { expect, test } from "vitest";
import type { DuplicateDecision, DuplicateNotice } from "./duplicate-decision.ts";
import type { ImportProgress } from "./import-progress.ts";
import { accepted, DuplicateHarness, file } from "./testing/duplicate-harness.ts";

const ignore = (): void => {};
const choose =
  (decision: DuplicateDecision, seen: DuplicateNotice[][] = []) =>
  async (notices: readonly DuplicateNotice[]): Promise<DuplicateDecision> => {
    seen.push([...notices]);
    return decision;
  };

function library() {
  return new DuplicateHarness(
    { "old.musicxml": accepted("Etude"), "again.musicxml": accepted("Etude") },
    [{ id: "existing-1", title: "Etude", hash: "hash-Etude", renamedTo: null }],
  );
}

test("imports the new files first and asks once about all the duplicates", async () => {
  const harness = new DuplicateHarness(
    {
      "new.musicxml": accepted("Prelude"),
      "dup1.musicxml": accepted("Etude"),
      "dup2.musicxml": accepted("Etude"),
    },
    [{ id: "existing-1", title: "Etude", hash: "hash-Etude", renamedTo: null }],
  );
  const seen: DuplicateNotice[][] = [];
  const files = [file("dup1.musicxml"), file("new.musicxml"), file("dup2.musicxml")];
  let savedBeforeAsking = false;
  await harness.importer().run(files, ignore, async (notices) => {
    savedBeforeAsking = harness.log.includes("add new.musicxml");
    seen.push([...notices]);
    return "skip-all";
  });
  expect(savedBeforeAsking).toBe(true);
  expect(seen).toHaveLength(1);
  expect(seen[0]?.map((notice) => notice.fileName)).toEqual(["dup1.musicxml", "dup2.musicxml"]);
  expect(seen[0]?.[0]).toMatchObject({ existingName: "Etude", reason: "same-content" });
});

test("does not ask anything when there are no duplicates", async () => {
  const harness = new DuplicateHarness({ "a.musicxml": accepted("A") }, []);
  const seen: DuplicateNotice[][] = [];
  await harness.importer().run([file("a.musicxml")], ignore, choose("skip-all", seen));
  expect(seen).toEqual([]);
});

test("skipping leaves the library unchanged and lists the files as skipped", async () => {
  const harness = library();
  const summary = await harness.importer().run([file("old.musicxml")], ignore, choose("skip-all"));
  expect(summary.outcomes[0]?.result).toEqual({ kind: "skipped" });
  expect(
    harness.log.filter((entry) => entry.startsWith("add") || entry.startsWith("replace")),
  ).toEqual([]);
  expect(summary.skippedCount).toBe(1);
});

test("skipping does not read the files again", async () => {
  const harness = library();
  await harness.importer().run([file("old.musicxml")], ignore, choose("skip-all"));
  expect(harness.log.filter((entry) => entry === "analyze old.musicxml")).toHaveLength(1);
});

test("replacing swaps the score of the existing song and keeps its id", async () => {
  const harness = library();
  const summary = await harness
    .importer()
    .run([file("old.musicxml")], ignore, choose("replace-all"));
  expect(summary.outcomes[0]?.result).toEqual({ kind: "replaced", songId: "existing-1" });
  expect(harness.replaced.map((song) => song.id)).toEqual(["existing-1"]);
  expect(summary.replacedCount).toBe(1);
});

test("replacing keeps a name the person chose", async () => {
  const harness = new DuplicateHarness({ "old.musicxml": accepted("Etude") }, [
    { id: "existing-1", title: "Etude", hash: "hash-Etude", renamedTo: "My piece" },
  ]);
  await harness.importer().run([file("old.musicxml")], ignore, choose("replace-all"));
  expect(harness.replaced[0]?.displayName).toBe("My piece");
});

test("keeping both adds a separate song", async () => {
  const harness = library();
  const summary = await harness
    .importer()
    .run([file("old.musicxml")], ignore, choose("keep-both-all"));
  const [song] = harness.added;
  expect(song).toBeDefined();
  expect(summary.outcomes[0]?.result).toEqual({ kind: "kept-both", songId: song?.id });
  expect(summary.keptBothCount).toBe(1);
});

test("two identical files in one batch import the first and hold the second", async () => {
  const harness = new DuplicateHarness(
    { "a.musicxml": accepted("Etude"), "b.musicxml": accepted("Etude") },
    [],
  );
  const seen: DuplicateNotice[][] = [];
  const summary = await harness
    .importer()
    .run([file("a.musicxml"), file("b.musicxml")], ignore, choose("skip-all", seen));
  expect(summary.outcomes.map((outcome) => outcome.result.kind)).toEqual(["imported", "skipped"]);
  expect(seen[0]?.map((notice) => notice.fileName)).toEqual(["b.musicxml"]);
});

test("a file that cannot be read again fails without affecting the others", async () => {
  const harness = new DuplicateHarness(
    { "dup1.musicxml": accepted("Etude"), "dup2.musicxml": accepted("Etude") },
    [{ id: "existing-1", title: "Etude", hash: "hash-Etude", renamedTo: null }],
  );
  harness.failSecondAnalysisOf("dup1.musicxml");
  const files = [file("dup1.musicxml"), file("dup2.musicxml")];
  const summary = await harness.importer().run(files, ignore, choose("keep-both-all"));
  expect(summary.outcomes.map((outcome) => outcome.result.kind)).toEqual(["failed", "kept-both"]);
});

test("a save failure while applying a duplicate becomes a failed file", async () => {
  const harness = library();
  harness.failSaves = true;
  const summary = await harness
    .importer()
    .run([file("old.musicxml")], ignore, choose("replace-all"));
  expect(summary.outcomes[0]?.result).toEqual({ kind: "failed", code: "storage-failed" });
});

test("when the existing song is gone by the time of replacing, the file is added as new", async () => {
  const harness = library();
  const summary = await harness.importer().run([file("old.musicxml")], ignore, async () => {
    harness.forgetExistingSongs();
    return "replace-all";
  });
  expect(summary.outcomes[0]?.result.kind).toBe("imported");
});

test("a decision that cannot be obtained counts as skipping", async () => {
  const harness = library();
  const summary = await harness.importer().run([file("old.musicxml")], ignore, async () => {
    throw new Error("dialog crashed");
  });
  expect(summary.outcomes[0]?.result).toEqual({ kind: "skipped" });
});

test("reports a held duplicate, then the result once the person has chosen", async () => {
  const harness = library();
  const events: ImportProgress[] = [];
  await harness
    .importer()
    .run([file("old.musicxml")], (progress) => events.push(progress), choose("replace-all"));
  expect(events.map((event) => event.step)).toEqual([
    "checking",
    "saving",
    "duplicate",
    "saving",
    "done",
  ]);
  expect(events.at(-1)?.result?.kind).toBe("replaced");
});

test("a single file that replaced a song is offered to open", async () => {
  const harness = library();
  const summary = await harness
    .importer()
    .run([file("old.musicxml")], ignore, choose("replace-all"));
  expect(summary.songToOpen).toBe("existing-1");
});

test("a single skipped file is not offered to open", async () => {
  const harness = library();
  const summary = await harness.importer().run([file("old.musicxml")], ignore, choose("skip-all"));
  expect(summary.songToOpen).toBeNull();
});
