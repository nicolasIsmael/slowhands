import { expect, test } from "vitest";
import { MAX_SONG_NAME_LENGTH, normalizeSongName } from "./song-rename.ts";

test("keeps a normal name as it is", () => {
  expect(normalizeSongName("Clair de lune")).toBe("Clair de lune");
});

test("trims the spaces around the name", () => {
  expect(normalizeSongName("   Nocturne  ")).toBe("Nocturne");
});

test("ignores an empty name", () => {
  expect(normalizeSongName("")).toBeNull();
});

test("ignores a name made only of whitespace", () => {
  expect(normalizeSongName(" \t\n  ")).toBeNull();
});

test("cuts a name that is too long", () => {
  const name = normalizeSongName("a".repeat(MAX_SONG_NAME_LENGTH + 50));
  expect(name).toBe("a".repeat(MAX_SONG_NAME_LENGTH));
});

test("never cuts a character in half", () => {
  const name = normalizeSongName("🎹".repeat(MAX_SONG_NAME_LENGTH + 1));
  expect(Array.from(name ?? "")).toHaveLength(MAX_SONG_NAME_LENGTH);
});

test("does not leave trailing spaces where it cut", () => {
  const name = normalizeSongName(`${"a".repeat(MAX_SONG_NAME_LENGTH - 1)} b`);
  expect(name).toBe("a".repeat(MAX_SONG_NAME_LENGTH - 1));
});
