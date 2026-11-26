import { createNewSong } from "@core/library/new-song.ts";
import type { PreparedScore } from "@core/viewer/prepared-score.ts";
import type { ScoreSourcePreparer } from "@core/viewer/score-source-preparer.ts";
import { expect, test } from "vitest";
import { InMemorySongStore } from "../testing/in-memory-song-store.ts";
import { RecordingScoreRenderer } from "../testing/recording-score-renderer.ts";
import { viewSong } from "./view-song.ts";

const surface = document.createElement("div");
const originalBytes = Uint8Array.from([1, 2, 3]);

async function storeWithSong(format: "musicxml" | "mxl" = "musicxml"): Promise<InMemorySongStore> {
  const store = new InMemorySongStore();
  const song = createNewSong({
    summary: { title: "Moonlight", composer: null, format, contentHash: "h" },
    fileName: "moon.musicxml",
    byteSize: 3,
    id: "song-1",
    now: 1000,
  });
  await store.add(song, originalBytes);
  return store;
}

const preparerReturning = (prepared: PreparedScore): ScoreSourcePreparer => ({
  prepare: async () => prepared,
});

test("draws the prepared score and reports the song's name and notices", async () => {
  const renderer = new RecordingScoreRenderer();
  const prepared = { xml: Uint8Array.from([9]), notices: ["some-symbols-not-displayed"] } as const;
  const state = await viewSong(
    { songReader: await storeWithSong(), preparer: preparerReturning(prepared), renderer },
    surface,
    "song-1",
  );
  expect(state).toEqual({ status: "ready", title: "Moonlight", notices: prepared.notices });
  expect(renderer.shown).toEqual([Uint8Array.from([9])]);
});

test("hands the stored bytes and format to the preparer", async () => {
  const calls: [Uint8Array, string][] = [];
  const preparer: ScoreSourcePreparer = {
    prepare: async (bytes, format) => {
      calls.push([bytes, format]);
      return { xml: bytes, notices: [] };
    },
  };
  await viewSong(
    { songReader: await storeWithSong("mxl"), preparer, renderer: new RecordingScoreRenderer() },
    surface,
    "song-1",
  );
  expect(calls).toEqual([[originalBytes, "mxl"]]);
});

test("reports a song that is no longer in the library", async () => {
  const state = await viewSong(
    {
      songReader: new InMemorySongStore(),
      preparer: preparerReturning({ xml: originalBytes, notices: [] }),
      renderer: new RecordingScoreRenderer(),
    },
    surface,
    "ghost",
  );
  expect(state).toEqual({ status: "failed", code: "song-not-found" });
});

test("reports a stored score that cannot be prepared", async () => {
  const preparer: ScoreSourcePreparer = {
    prepare: async () => {
      throw new Error("corrupt");
    },
  };
  const state = await viewSong(
    { songReader: await storeWithSong(), preparer, renderer: new RecordingScoreRenderer() },
    surface,
    "song-1",
  );
  expect(state).toEqual({ status: "failed", code: "score-unreadable" });
});

test("reports a score the renderer could not draw", async () => {
  const renderer = new RecordingScoreRenderer({ status: "failed", code: "render-failed" });
  const state = await viewSong(
    {
      songReader: await storeWithSong(),
      preparer: preparerReturning({ xml: originalBytes, notices: [] }),
      renderer,
    },
    surface,
    "song-1",
  );
  expect(state).toEqual({ status: "failed", code: "render-failed" });
});
