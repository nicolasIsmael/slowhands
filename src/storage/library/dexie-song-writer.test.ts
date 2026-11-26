import "fake-indexeddb/auto";
import { StorageFailure } from "@core/library/storage-failure.ts";
import { expect, test } from "vitest";
import { SlowHandsDatabase } from "../database/slow-hands-database.ts";
import { DexieSongWriter } from "./dexie-song-writer.ts";
import { aSongRecord } from "./testing/a-song-record.ts";

let counter = 0;
function setup() {
  const database = new SlowHandsDatabase(`writer-test-${counter++}`);
  return { database, writer: new DexieSongWriter(database) };
}

const bytes = (...values: number[]): Uint8Array => Uint8Array.from(values);

async function failureOf(action: Promise<unknown>): Promise<StorageFailure | null> {
  try {
    await action;
  } catch (error) {
    return error instanceof StorageFailure ? error : null;
  }
  return null;
}

test("adds a song together with its original file", async () => {
  const { database, writer } = setup();
  await writer.add(aSongRecord(), bytes(1, 2, 3));
  expect(await database.songs.count()).toBe(1);
  const stored = await database.scoreFiles.get("song-1");
  expect(Array.from(new Uint8Array(stored?.bytes ?? new ArrayBuffer(0)))).toEqual([1, 2, 3]);
});

test("leaves nothing behind when the original file cannot be written", async () => {
  const { database, writer } = setup();
  database.scoreFiles.hook("creating", () => {
    throw new Error("disk problem");
  });
  const failure = await failureOf(writer.add(aSongRecord(), bytes(1)));
  expect(failure?.code).toBe("storage-failed");
  expect(await database.songs.count()).toBe(0);
});

test("reports a full device as storage-full and leaves nothing behind", async () => {
  const { database, writer } = setup();
  database.scoreFiles.hook("creating", () => {
    throw new DOMException("quota", "QuotaExceededError");
  });
  const failure = await failureOf(writer.add(aSongRecord(), bytes(1)));
  expect(failure?.code).toBe("storage-full");
  expect(await database.songs.count()).toBe(0);
});

test("replacing keeps the id and overwrites both the record and the file", async () => {
  const { database, writer } = setup();
  await writer.add(aSongRecord(), bytes(1));
  await writer.replace(
    "song-1",
    aSongRecord({ id: "ignored", displayName: "New", contentHash: "h2" }),
    bytes(9, 9),
  );
  expect(await database.songs.count()).toBe(1);
  expect((await database.songs.get("song-1"))?.displayName).toBe("New");
  expect(
    Array.from(
      new Uint8Array((await database.scoreFiles.get("song-1"))?.bytes ?? new ArrayBuffer(0)),
    ),
  ).toEqual([9, 9]);
});

test("renaming changes only the display name and remembers the person renamed it", async () => {
  const { database, writer } = setup();
  await writer.add(aSongRecord(), bytes(1));
  await writer.rename("song-1", "My favorite");
  const song = await database.songs.get("song-1");
  expect(song).toMatchObject({ displayName: "My favorite", isRenamed: true, title: "Moonlight" });
});

test("opening a song records when, and makes it the latest activity", async () => {
  const { database, writer } = setup();
  await writer.add(aSongRecord({ addedAt: 1000, activityAt: 1000 }), bytes(1));
  await writer.markOpened("song-1", 7000);
  expect(await database.songs.get("song-1")).toMatchObject({
    lastOpenedAt: 7000,
    activityAt: 7000,
  });
});

test("opening a song that no longer exists changes nothing", async () => {
  const { database, writer } = setup();
  await writer.markOpened("ghost", 7000);
  expect(await database.songs.count()).toBe(0);
});

test("removing a song removes its record and its original file", async () => {
  const { database, writer } = setup();
  await writer.add(aSongRecord(), bytes(1));
  await writer.remove("song-1");
  expect(await database.songs.count()).toBe(0);
  expect(await database.scoreFiles.count()).toBe(0);
});
