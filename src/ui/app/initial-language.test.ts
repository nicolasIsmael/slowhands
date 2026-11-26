import type { AppLanguage } from "@core/settings/app-language.ts";
import type { SettingsRepository } from "@core/settings/settings-repository.ts";
import { expect, test } from "vitest";
import { loadInitialLanguage } from "./initial-language.ts";

const settingsReturning = (read: () => Promise<AppLanguage | null>): SettingsRepository => ({
  getLanguage: read,
  setLanguage: async () => {},
});

test("uses the saved language when it can be read", async () => {
  const settings = settingsReturning(async () => "es");
  expect(await loadInitialLanguage(settings, ["en-US"])).toBe("es");
});

test("uses the device language when nothing was saved", async () => {
  const settings = settingsReturning(async () => null);
  expect(await loadInitialLanguage(settings, ["es-ES"])).toBe("es");
});

test("uses the device language when reading the saved choice fails", async () => {
  const settings = settingsReturning(async () => {
    throw new Error("database unavailable");
  });
  expect(await loadInitialLanguage(settings, ["es-ES"])).toBe("es");
});

test("stops waiting after the timeout and uses the device language", async () => {
  const settings = settingsReturning(() => new Promise(() => {}));
  expect(await loadInitialLanguage(settings, ["es-ES"], 20)).toBe("es");
});
