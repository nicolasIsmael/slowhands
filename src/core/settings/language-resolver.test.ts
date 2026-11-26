import { expect, test } from "vitest";
import { LanguageResolver } from "./language-resolver.ts";

const resolver = new LanguageResolver();

test("a saved choice wins over the device languages", () => {
  expect(resolver.resolve("es", ["en-US"])).toBe("es");
  expect(resolver.resolve("en", ["es-MX"])).toBe("en");
});

test("uses the first device language whose base language is supported", () => {
  expect(resolver.resolve(null, ["es-MX", "en-US"])).toBe("es");
  expect(resolver.resolve(null, ["fr-FR", "es-ES"])).toBe("es");
});

test("falls back to English when no device language is supported", () => {
  expect(resolver.resolve(null, ["fr-FR", "de"])).toBe("en");
});

test("falls back to English when the device list is empty", () => {
  expect(resolver.resolve(null, [])).toBe("en");
});

test("ignores letter case and underscores in language tags", () => {
  expect(resolver.resolve(null, ["ES_ar"])).toBe("es");
  expect(resolver.resolve(null, ["EN-gb"])).toBe("en");
});
