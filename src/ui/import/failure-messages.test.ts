import { expect, test } from "vitest";
import enImport from "../i18n/locales/en/import.json";
import esImport from "../i18n/locales/es/import.json";
import { FAILURE_KEYS } from "./failure-messages.ts";

const bases = Object.values(FAILURE_KEYS);

test("maps every failure code to a different message", () => {
  expect(new Set(bases).size).toBe(Object.keys(FAILURE_KEYS).length);
});

test("every failure has a title and a hint in English", () => {
  for (const base of bases) {
    const entry = enImport.failure[base.replace("failure.", "") as keyof typeof enImport.failure];
    expect(entry?.title, base).toBeTruthy();
    expect(entry?.hint, base).toBeTruthy();
  }
});

test("every failure has a title and a hint in Spanish", () => {
  for (const base of bases) {
    const entry = esImport.failure[base.replace("failure.", "") as keyof typeof esImport.failure];
    expect(entry?.title, base).toBeTruthy();
    expect(entry?.hint, base).toBeTruthy();
  }
});
