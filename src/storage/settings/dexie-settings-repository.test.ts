import "fake-indexeddb/auto";
import { expect, test } from "vitest";
import { SlowHandsDatabase } from "../database/slow-hands-database.ts";
import { DexieSettingsRepository } from "./dexie-settings-repository.ts";

let counter = 0;
const repository = (): DexieSettingsRepository =>
  new DexieSettingsRepository(new SlowHandsDatabase(`settings-test-${counter++}`));

test("returns null when no language has been saved", async () => {
  expect(await repository().getLanguage()).toBeNull();
});

test("returns the language that was saved", async () => {
  const settings = repository();
  await settings.setLanguage("es");
  expect(await settings.getLanguage()).toBe("es");
});

test("the latest saved language replaces the previous one", async () => {
  const settings = repository();
  await settings.setLanguage("es");
  await settings.setLanguage("en");
  expect(await settings.getLanguage()).toBe("en");
});

test("ignores a stored value that is not a supported language", async () => {
  const database = new SlowHandsDatabase(`settings-test-${counter++}`);
  await database.settings.put({ key: "language", value: "fr" });
  expect(await new DexieSettingsRepository(database).getLanguage()).toBeNull();
});
