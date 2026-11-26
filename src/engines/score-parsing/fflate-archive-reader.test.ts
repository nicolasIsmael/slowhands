import { ScoreRejection } from "@core/score/score-rejection.ts";
import { expect, test } from "vitest";
import { FflateArchiveReader } from "./fflate-archive-reader.ts";
import { readFixture } from "./testing/fixture-files.ts";

const reader = new FflateArchiveReader();
const archive = (): Uint8Array => readFixture("piano-grand-staff.mxl");
const LARGE = 1_000_000;

function codeOf(action: () => unknown): string {
  try {
    action();
  } catch (error) {
    return error instanceof ScoreRejection ? error.code : "other error";
  }
  return "accepted";
}

test("lists the entries of an archive without unpacking them", () => {
  const names = reader.listEntries(archive()).map((entry) => entry.name);
  expect(names).toEqual(["META-INF/container.xml", "piano-grand-staff.musicxml"]);
});

test("reports the unpacked size of each entry", () => {
  const entries = reader.listEntries(archive());
  expect(
    entries.find((entry) => entry.name === "piano-grand-staff.musicxml")?.uncompressedSize,
  ).toBe(8192);
});

test("unpacks one entry", () => {
  const data = reader.readEntry(archive(), "piano-grand-staff.musicxml", LARGE);
  expect(new TextDecoder().decode(data.subarray(0, 5))).toBe("<?xml");
  expect(data.length).toBe(8192);
});

test("refuses an entry larger than the limit before unpacking it", () => {
  expect(codeOf(() => reader.readEntry(archive(), "piano-grand-staff.musicxml", 100))).toBe(
    "unpacked-too-large",
  );
});

test("rejects an entry that does not exist", () => {
  expect(codeOf(() => reader.readEntry(archive(), "missing.xml", LARGE))).toBe(
    "archive-without-score",
  );
});

test("rejects a damaged archive when listing and when unpacking", () => {
  const damaged = readFixture("invalid/corrupt-archive.mxl");
  expect(codeOf(() => reader.listEntries(damaged))).toBe("archive-corrupted");
  expect(codeOf(() => reader.readEntry(damaged, "x", LARGE))).toBe("archive-corrupted");
});

test("rejects bytes that are not an archive", () => {
  expect(codeOf(() => reader.listEntries(new Uint8Array([1, 2, 3])))).toBe("archive-corrupted");
});
