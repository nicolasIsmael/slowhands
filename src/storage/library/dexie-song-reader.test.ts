import "fake-indexeddb/auto";
import type { LibraryEntry } from "@core/library/library-entry.ts";
import { expect, test, vi } from "vitest";
import { SlowHandsDatabase } from "../database/slow-hands-database.ts";
import { DexieSongReader } from "./dexie-song-reader.ts";
import { DexieSongWriter } from "./dexie-song-writer.ts";
import { aSongRecord } from "./testing/a-song-record.ts";

let counter = 0;
function setup() {
  const database = new SlowHandsDatabase(`reader-test-${counter++}`);
  return { reader: new DexieSongReader(database), writer: new DexieSongWriter(database) };
}

const bytes = (...values: number[]): Uint8Array => Uint8Array.from(values);

function watch(reader: DexieSongReader) {
  const emissions: LibraryEntry[][] = [];
  const stop = reader.watchLibrary().subscribe(
    (entries) => emissions.push(entries),
    () => {},
  );
  return { emissions, stop };
}

test("reads back a song and its original file", async () => {
  const { reader, writer } = setup();
  await writer.add(aSongRecord(), bytes(5, 6));
  expect((await reader.get("song-1"))?.displayName).toBe("Moonlight");
  expect(Array.from((await reader.readOriginal("song-1")) ?? [])).toEqual([5, 6]);
});

test("returns null for a song that does not exist", async () => {
  const { reader } = setup();
  expect(await reader.get("ghost")).toBeNull();
  expect(await reader.readOriginal("ghost")).toBeNull();
});

test("the watched library starts with the current songs, newest activity first", async () => {
  const { reader, writer } = setup();
  await writer.add(aSongRecord({ id: "old", displayName: "Old", activityAt: 1000 }), bytes(1));
  await writer.add(aSongRecord({ id: "new", displayName: "New", activityAt: 3000 }), bytes(1));
  await writer.add(aSongRecord({ id: "mid", displayName: "Mid", activityAt: 2000 }), bytes(1));
  const { emissions, stop } = watch(reader);
  await vi.waitFor(() => expect(emissions.length).toBeGreaterThan(0));
  expect(emissions[0]?.map((entry) => entry.displayName)).toEqual(["New", "Mid", "Old"]);
  stop();
});

test("the watched library lists only what a row needs, never the file bytes", async () => {
  const { reader, writer } = setup();
  await writer.add(aSongRecord(), bytes(1));
  const { emissions, stop } = watch(reader);
  await vi.waitFor(() => expect(emissions.length).toBeGreaterThan(0));
  expect(Object.keys(emissions[0]?.[0] ?? {}).sort()).toEqual([
    "activityAt",
    "composer",
    "displayName",
    "id",
    "sourceFileName",
  ]);
  stop();
});

test("opening an older song moves it to the top of the watched library", async () => {
  const { reader, writer } = setup();
  await writer.add(
    aSongRecord({ id: "a", displayName: "A", addedAt: 1000, activityAt: 1000 }),
    bytes(1),
  );
  await writer.add(
    aSongRecord({ id: "b", displayName: "B", addedAt: 2000, activityAt: 2000 }),
    bytes(1),
  );
  const { emissions, stop } = watch(reader);
  await vi.waitFor(() => expect(emissions.at(-1)?.[0]?.displayName).toBe("B"));
  await writer.markOpened("a", 5000);
  await vi.waitFor(() => expect(emissions.at(-1)?.[0]?.displayName).toBe("A"));
  stop();
});

test("stops telling a subscriber once it unsubscribes", async () => {
  const { reader, writer } = setup();
  const { emissions, stop } = watch(reader);
  await vi.waitFor(() => expect(emissions.length).toBe(1));
  stop();
  await writer.add(aSongRecord(), bytes(1));
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(emissions).toHaveLength(1);
});
