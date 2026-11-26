import { expect, test } from "vitest";
import { createNewSong } from "./new-song.ts";
import type { SongRecord } from "./song-record.ts";
import { replacementFor } from "./song-replacement.ts";

const existing: SongRecord = createNewSong({
  summary: { title: "Old title", composer: null, format: "musicxml", contentHash: "old" },
  fileName: "old.musicxml",
  byteSize: 1,
  id: "song-1",
  now: 1000,
});

const fresh: SongRecord = createNewSong({
  summary: { title: "New title", composer: "Bach", format: "mxl", contentHash: "new" },
  fileName: "new.mxl",
  byteSize: 2,
  id: "song-2",
  now: 9000,
});

test("keeps the existing song's identity and takes the new score", () => {
  const replaced = replacementFor(existing, fresh);
  expect(replaced.id).toBe("song-1");
  expect(replaced.contentHash).toBe("new");
  expect(replaced.format).toBe("mxl");
  expect(replaced.sourceFileName).toBe("new.mxl");
});

test("takes the title of the new score when the person never renamed the song", () => {
  expect(replacementFor(existing, fresh).displayName).toBe("New title");
});

test("keeps the name the person chose", () => {
  const renamed = { ...existing, displayName: "My favourite", isRenamed: true };
  const replaced = replacementFor(renamed, fresh);
  expect(replaced.displayName).toBe("My favourite");
  expect(replaced.isRenamed).toBe(true);
});

test("treats the song as the most recently added", () => {
  const replaced = replacementFor({ ...existing, lastOpenedAt: 5000 }, fresh);
  expect(replaced.addedAt).toBe(9000);
  expect(replaced.activityAt).toBe(9000);
  expect(replaced.lastOpenedAt).toBeNull();
});
