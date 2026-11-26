import { afterEach, expect, test, vi } from "vitest";
import { BrowserStoragePersistence } from "./browser-storage-persistence.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("reports whether the browser agreed to keep the data", async () => {
  vi.stubGlobal("navigator", { storage: { persist: async () => true } });
  expect(await new BrowserStoragePersistence().request()).toBe(true);
  vi.stubGlobal("navigator", { storage: { persist: async () => false } });
  expect(await new BrowserStoragePersistence().request()).toBe(false);
});

test("reports false when the browser has no persistent-storage request", async () => {
  vi.stubGlobal("navigator", {});
  expect(await new BrowserStoragePersistence().request()).toBe(false);
});

test("reports false when the request fails", async () => {
  vi.stubGlobal("navigator", {
    storage: {
      persist: async () => {
        throw new Error("denied");
      },
    },
  });
  expect(await new BrowserStoragePersistence().request()).toBe(false);
});
