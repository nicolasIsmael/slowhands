import { expect, test } from "vitest";
import type { ScoreSummary } from "../score/score-summary.ts";
import { createNewSong, EXTRACTOR_VERSION, fileNameStem } from "./new-song.ts";

const summary = (overrides: Partial<ScoreSummary> = {}): ScoreSummary => ({
  title: "Moonlight",
  composer: "Beethoven",
  format: "musicxml",
  contentHash: "abc123",
  ...overrides,
});

const build = (score: ScoreSummary, fileName = "moon.musicxml") =>
  createNewSong({ summary: score, fileName, byteSize: 42, id: "id-1", now: 1000 });

test("is named after the title", () => {
  expect(build(summary()).displayName).toBe("Moonlight");
});

test("is named after the file name without its extension when there is no title", () => {
  expect(build(summary({ title: null }), "My Score.musicxml").displayName).toBe("My Score");
});

test("starts as not renamed, never opened, active since it was added", () => {
  const song = build(summary());
  expect(song.isRenamed).toBe(false);
  expect(song.lastOpenedAt).toBeNull();
  expect(song.addedAt).toBe(1000);
  expect(song.activityAt).toBe(1000);
});

test("records where it came from and what was found", () => {
  const song = build(summary({ format: "mxl" }), "moon.mxl");
  expect(song).toMatchObject({
    id: "id-1",
    title: "Moonlight",
    composer: "Beethoven",
    sourceFileName: "moon.mxl",
    format: "mxl",
    byteSize: 42,
    contentHash: "abc123",
    extractorVersion: EXTRACTOR_VERSION,
  });
});

test("keeps accents, non-Latin characters and emoji in the name", () => {
  expect(build(summary({ title: null }), "Café ñandú 🎹.musicxml").displayName).toBe(
    "Café ñandú 🎹",
  );
});

test("takes the stem of names with several dots or no extension", () => {
  expect(fileNameStem("archive.tar.mxl")).toBe("archive.tar");
  expect(fileNameStem("plain")).toBe("plain");
  expect(fileNameStem(".mxl")).toBe(".mxl");
});
