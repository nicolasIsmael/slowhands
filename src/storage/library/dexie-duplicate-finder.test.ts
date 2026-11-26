import "fake-indexeddb/auto";
import { expect, test } from "vitest";
import { SlowHandsDatabase } from "../database/slow-hands-database.ts";
import { DexieDuplicateFinder } from "./dexie-duplicate-finder.ts";
import { DexieSongWriter } from "./dexie-song-writer.ts";
import { aSongRecord } from "./testing/a-song-record.ts";

let counter = 0;
async function setup() {
  const database = new SlowHandsDatabase(`finder-test-${counter++}`);
  await new DexieSongWriter(database).add(aSongRecord(), Uint8Array.from([1]));
  return new DexieDuplicateFinder(database);
}

test("finds a song with the same content", async () => {
  const finder = await setup();
  const match = await finder.findDuplicate({ contentHash: "hash-1", identityKey: "other" });
  expect(match).toMatchObject({ reason: "same-content", existing: { id: "song-1" } });
});

test("finds a song with the same identity when the content differs", async () => {
  const finder = await setup();
  const key = "score:moonlight\u0000beethoven";
  const match = await finder.findDuplicate({ contentHash: "different", identityKey: key });
  expect(match).toMatchObject({ reason: "same-identity", existing: { id: "song-1" } });
});

test("prefers the same-content reason when both match", async () => {
  const finder = await setup();
  const key = "score:moonlight\u0000beethoven";
  const match = await finder.findDuplicate({ contentHash: "hash-1", identityKey: key });
  expect(match?.reason).toBe("same-content");
});

test("finds nothing for a song that is new", async () => {
  const finder = await setup();
  expect(await finder.findDuplicate({ contentHash: "new", identityKey: "new" })).toBeNull();
});
