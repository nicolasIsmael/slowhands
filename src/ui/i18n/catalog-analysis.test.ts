import { expect, test } from "vitest";
import {
  baseKey,
  flattenCatalog,
  missingPluralForms,
  placeholdersByBaseKey,
  placeholdersOf,
} from "./catalog-analysis.ts";

test("flattens nested keys into dotted paths", () => {
  const entries = flattenCatalog({ list: { empty: { title: "Empty" } }, name: "App" });
  expect([...entries.keys()]).toEqual(["list.empty.title", "name"]);
});

test("finds each placeholder once, sorted", () => {
  expect(placeholdersOf("{{limit}} of {{ count }} and {{limit}}")).toEqual(["count", "limit"]);
});

test("removes a plural suffix to get the base key", () => {
  expect(baseKey("summary.imported_other")).toBe("summary.imported");
  expect(baseKey("summary.title")).toBe("summary.title");
});

test("reports plural categories a locale needs but the catalog lacks", () => {
  const english = new Map([
    ["n_one", "1"],
    ["n_other", "many"],
  ]);
  expect(missingPluralForms(english, "en")).toEqual([]);
  expect(missingPluralForms(english, "es")).toEqual(["n_many"]);
});

test("groups placeholders across the plural forms of one key", () => {
  const entries = new Map([
    ["n_one", "{{count}} file"],
    ["n_other", "{{count}} files"],
  ]);
  expect(placeholdersByBaseKey(entries).get("n")).toEqual(["count"]);
});
