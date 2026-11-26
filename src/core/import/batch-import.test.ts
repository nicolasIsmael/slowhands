import { expect, test } from "vitest";
import type { IdGenerator } from "../identity/id-generator.ts";
import type { DuplicateFinder } from "../library/duplicate-finder.ts";
import type { SongRecord } from "../library/song-record.ts";
import type { SongWriter } from "../library/song-writer.ts";
import { StorageFailure } from "../library/storage-failure.ts";
import { FilePrecheck } from "../score/file-precheck.ts";
import type { Clock } from "../time/clock.ts";
import { BatchImport } from "./batch-import.ts";
import type { FileSource } from "./file-source.ts";
import type { ImportProgress } from "./import-progress.ts";
import type { ScoreAnalysis, ScoreAnalyzer } from "./score-analyzer.ts";

const file = (name: string, sizeBytes = 10): FileSource => ({
  name,
  sizeBytes,
  readBytes: async () => new Uint8Array(sizeBytes),
});

const accepted = (title: string): ScoreAnalysis => ({
  status: "accepted",
  summary: { title, composer: null, format: "musicxml", contentHash: `hash-${title}` },
  bytes: new Uint8Array(10),
});

class Harness {
  readonly log: string[] = [];
  readonly saved: SongRecord[] = [];
  released = 0;
  private nextId = 0;

  private readonly analyses: Record<string, ScoreAnalysis | Error>;
  private readonly failingSaves: Record<string, StorageFailure | Error>;

  constructor(
    analyses: Record<string, ScoreAnalysis | Error>,
    failingSaves: Record<string, StorageFailure | Error> = {},
  ) {
    this.analyses = analyses;
    this.failingSaves = failingSaves;
  }

  readonly analyzer: ScoreAnalyzer = {
    analyze: async (source) => {
      this.log.push(`analyze ${source.name}`);
      const analysis = this.analyses[source.name];
      if (analysis instanceof Error) {
        throw analysis;
      }
      return analysis ?? { status: "rejected", code: "not-a-score" };
    },
    release: () => {
      this.released += 1;
    },
  };

  readonly finder: DuplicateFinder = { findDuplicate: async () => null };

  readonly writer: SongWriter = {
    add: async (song) => {
      this.log.push(`save ${song.sourceFileName}`);
      const failure = this.failingSaves[song.sourceFileName];
      if (failure) {
        throw failure;
      }
      this.saved.push(song);
    },
    replace: async () => {},
    rename: async () => {},
    markOpened: async () => {},
    remove: async () => {},
  };

  readonly ids: IdGenerator = { next: () => `song-${++this.nextId}` };
  readonly clock: Clock = { now: () => 5000 };

  importer(maxBytes?: number): BatchImport {
    return new BatchImport({
      precheck: new FilePrecheck(maxBytes),
      analyzer: this.analyzer,
      writer: this.writer,
      finder: this.finder,
      ids: this.ids,
      clock: this.clock,
    });
  }
}

const ignore = (): void => {};
const skipAll = async (): Promise<"skip-all"> => "skip-all";

test("imports the files in the order they were picked", async () => {
  const harness = new Harness({ "a.musicxml": accepted("A"), "b.musicxml": accepted("B") });
  const summary = await harness
    .importer()
    .run([file("a.musicxml"), file("b.musicxml")], ignore, skipAll);
  expect(summary.outcomes.map((outcome) => outcome.fileName)).toEqual(["a.musicxml", "b.musicxml"]);
  expect(summary.outcomes.map((outcome) => outcome.result.kind)).toEqual(["imported", "imported"]);
  expect(harness.saved.map((song) => song.id)).toEqual(["song-1", "song-2"]);
});

test("a failed file never affects the files around it", async () => {
  const harness = new Harness({ "a.musicxml": accepted("A"), "c.musicxml": accepted("C") });
  const files = [file("a.musicxml"), file("bad.musicxml"), file("c.musicxml")];
  const summary = await harness.importer().run(files, ignore, skipAll);
  expect(summary.outcomes.map((outcome) => outcome.result.kind)).toEqual([
    "imported",
    "failed",
    "imported",
  ]);
  expect(summary.importedCount).toBe(2);
  expect(summary.failedCount).toBe(1);
});

test("saves each new song before the next file is checked", async () => {
  const harness = new Harness({ "a.musicxml": accepted("A"), "b.musicxml": accepted("B") });
  await harness.importer().run([file("a.musicxml"), file("b.musicxml")], ignore, skipAll);
  expect(harness.log).toEqual([
    "analyze a.musicxml",
    "save a.musicxml",
    "analyze b.musicxml",
    "save b.musicxml",
  ]);
});

test("reports each step and the result as soon as a file is finished", async () => {
  const harness = new Harness({ "a.musicxml": accepted("A") });
  const events: ImportProgress[] = [];
  await harness.importer().run([file("a.musicxml")], (progress) => events.push(progress), skipAll);
  expect(events.map((event) => event.step)).toEqual(["checking", "saving", "done"]);
  expect(events.at(-1)?.result).toEqual({ kind: "imported", songId: "song-1" });
  expect(events[0]).toMatchObject({ fileIndex: 0, fileCount: 1, fileName: "a.musicxml" });
});

test("refuses an oversized file without reading it", async () => {
  const harness = new Harness({ "big.musicxml": accepted("Big") });
  const summary = await harness.importer(5).run([file("big.musicxml", 6)], ignore, skipAll);
  expect(summary.outcomes[0]?.result).toEqual({ kind: "failed", code: "file-too-large" });
  expect(harness.log).toEqual([]);
});

test("reports a full device as a storage-full failure and carries on", async () => {
  const harness = new Harness(
    { "a.musicxml": accepted("A"), "b.musicxml": accepted("B") },
    { "a.musicxml": new StorageFailure("storage-full") },
  );
  const summary = await harness
    .importer()
    .run([file("a.musicxml"), file("b.musicxml")], ignore, skipAll);
  expect(summary.outcomes[0]?.result).toEqual({ kind: "failed", code: "storage-full" });
  expect(summary.outcomes[1]?.result.kind).toBe("imported");
});

test("reports any other save error as a storage failure", async () => {
  const harness = new Harness({ "a.musicxml": accepted("A") }, { "a.musicxml": new Error("boom") });
  const summary = await harness.importer().run([file("a.musicxml")], ignore, skipAll);
  expect(summary.outcomes[0]?.result).toEqual({ kind: "failed", code: "storage-failed" });
});

test("reports an analyzer that throws as an unexpected error", async () => {
  const harness = new Harness({ "a.musicxml": new Error("worker crashed") });
  const summary = await harness.importer().run([file("a.musicxml")], ignore, skipAll);
  expect(summary.outcomes[0]?.result).toEqual({ kind: "failed", code: "unexpected-error" });
});

test("releases the analyzer when the batch ends", async () => {
  const harness = new Harness({ "a.musicxml": accepted("A") });
  await harness.importer().run([file("a.musicxml")], ignore, skipAll);
  expect(harness.released).toBe(1);
});

test("offers to open the song only when a single file was imported", async () => {
  const harness = new Harness({ "a.musicxml": accepted("A"), "b.musicxml": accepted("B") });
  const single = await harness.importer().run([file("a.musicxml")], ignore, skipAll);
  expect(single.songToOpen).toBe("song-1");
  const several = await harness
    .importer()
    .run([file("a.musicxml"), file("b.musicxml")], ignore, skipAll);
  expect(several.songToOpen).toBeNull();
  const failed = await harness.importer().run([file("bad.musicxml")], ignore, skipAll);
  expect(failed.songToOpen).toBeNull();
});
