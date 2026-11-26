import "fake-indexeddb/auto";
import { expect, test } from "vitest";
import { SlowHandsDatabase } from "./slow-hands-database.ts";

let counter = 0;
const freshName = (): string => `test-database-${counter++}`;

test("opens with the songs, scoreFiles and settings tables", async () => {
  const database = new SlowHandsDatabase(freshName());
  await database.open();
  const tables = database.tables.map((table) => table.name).sort();
  expect(tables).toEqual(["scoreFiles", "settings", "songs"]);
  database.close();
});

test("keeps stored data when the database is closed and opened again", async () => {
  const name = freshName();
  const first = new SlowHandsDatabase(name);
  await first.settings.put({ key: "language", value: "es" });
  first.close();

  const second = new SlowHandsDatabase(name);
  expect(await second.settings.get("language")).toEqual({ key: "language", value: "es" });
  second.close();
});

test("indexes songs by activity, content hash and identity key", async () => {
  const database = new SlowHandsDatabase(freshName());
  await database.open();
  const indexes = database.songs.schema.indexes.map((index) => index.name).sort();
  expect(indexes).toEqual(["activityAt", "contentHash", "identityKey"]);
  database.close();
});
