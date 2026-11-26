import { expect, test } from "vitest";
import { identityKeyFor } from "./song-identity.ts";

const key = (title: string | null, composer: string | null, fileName = "a.musicxml") =>
  identityKeyFor({ title, composer, fileName });

test("the same title and composer give the same key whatever the case or spacing", () => {
  expect(key("Moonlight  Sonata", "Beethoven")).toBe(key(" moonlight sonata ", "BEETHOVEN"));
});

test("different composers give different keys", () => {
  expect(key("Prelude", "Bach")).not.toBe(key("Prelude", "Chopin"));
});

test("a missing title or composer falls back to the file name", () => {
  expect(key(null, "Bach", "Prelude.musicxml")).toBe(key("Fugue", null, "prelude.MUSICXML"));
  expect(key(null, null, "Prelude.musicxml")).not.toBe(key(null, null, "Other.musicxml"));
});

test("a title with a composer is not confused with a file name", () => {
  expect(key("a.musicxml", "x", "z.musicxml")).not.toBe(key(null, null, "a.musicxml"));
});

test("composed and decomposed accents give the same key", () => {
  expect(key("Café", "José")).toBe(key("Café", "José"));
});

test("keeps non-Latin characters and emoji distinct", () => {
  expect(key("山田 🎹", "x")).not.toBe(key("山田", "x"));
});
