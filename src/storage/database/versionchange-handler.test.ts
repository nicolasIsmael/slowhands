import "fake-indexeddb/auto";
import { expect, test } from "vitest";
import { SCHEMA_VERSION } from "./migrations/all-migrations.ts";
import { SlowHandsDatabase } from "./slow-hands-database.ts";

let counter = 0;
const nextName = (): string => `versionchange-test-${counter++}`;

/** What another tab does when it ships a newer schema: open the same database at a higher version. */
function upgradeFromAnotherTab(name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const opening = indexedDB.open(name, (SCHEMA_VERSION + 1) * 10);
    opening.onerror = () => reject(opening.error);
    opening.onsuccess = () => {
      opening.result.close();
      resolve();
    };
  });
}

function watch(database: SlowHandsDatabase): boolean[] {
  const seen: boolean[] = [];
  database.supersession.superseded.subscribe(
    (value) => seen.push(value),
    () => {},
  );
  return seen;
}

test("is not superseded while nothing else touches the database", async () => {
  const database = new SlowHandsDatabase(nextName());
  const seen = watch(database);
  await database.open();
  expect(seen).toEqual([false]);
  expect(database.isOpen()).toBe(true);
  database.close();
});

test("closes its connection when another tab upgrades the database", async () => {
  const name = nextName();
  const database = new SlowHandsDatabase(name);
  await database.open();
  await upgradeFromAnotherTab(name);
  expect(database.isOpen()).toBe(false);
});

test("raises the reload notice when another tab upgrades the database", async () => {
  const name = nextName();
  const database = new SlowHandsDatabase(name);
  const seen = watch(database);
  await database.open();
  await upgradeFromAnotherTab(name);
  expect(seen).toEqual([false, true]);
});

test("lets the other tab's upgrade finish instead of blocking it", async () => {
  const name = nextName();
  const database = new SlowHandsDatabase(name);
  await database.open();
  await expect(upgradeFromAnotherTab(name)).resolves.toBeUndefined();
});
