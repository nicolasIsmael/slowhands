import { expect, test } from "vitest";
import { createNewSong } from "./new-song.ts";
import { recordOpening } from "./song-opening.ts";

const song = createNewSong({
  summary: { title: "T", composer: null, format: "musicxml", contentHash: "h" },
  fileName: "t.musicxml",
  byteSize: 1,
  id: "id",
  now: 1000,
});

test("remembers when the song was opened and makes that its latest activity", () => {
  const opened = recordOpening(song, 5000);
  expect(opened.lastOpenedAt).toBe(5000);
  expect(opened.activityAt).toBe(5000);
});

test("keeps the added time as the latest activity if the clock reads earlier", () => {
  expect(recordOpening(song, 10).activityAt).toBe(1000);
});

test("leaves everything else about the song alone", () => {
  expect(recordOpening(song, 5000)).toEqual({ ...song, lastOpenedAt: 5000, activityAt: 5000 });
});
