import { expect, test } from "vitest";
import {
  baseKey,
  type Catalog,
  flattenCatalog,
  missingPluralForms,
  placeholdersByBaseKey,
} from "./catalog-analysis.ts";
import { NAMESPACES } from "./resources.ts";

const modules = import.meta.glob<Catalog>("./locales/*/*.json", { eager: true, import: "default" });
const LANGUAGES = ["en", "es"] as const;

function entriesFor(language: string, namespace: string): Map<string, string> {
  const catalog = modules[`./locales/${language}/${namespace}.json`];
  return catalog ? flattenCatalog(catalog) : new Map();
}

const normalizedKeys = (entries: Map<string, string>): string[] =>
  [...new Set([...entries.keys()].map(baseKey))].sort();

test("every namespace exists in both languages", () => {
  for (const namespace of NAMESPACES) {
    for (const language of LANGUAGES) {
      const catalog = modules[`./locales/${language}/${namespace}.json`];
      expect(catalog, `${language}/${namespace}`).toBeDefined();
    }
  }
});

test("both languages define exactly the same keys", () => {
  for (const namespace of NAMESPACES) {
    const english = normalizedKeys(entriesFor("en", namespace));
    expect(normalizedKeys(entriesFor("es", namespace)), namespace).toEqual(english);
  }
});

test("both languages use the same placeholders for each key", () => {
  for (const namespace of NAMESPACES) {
    const english = placeholdersByBaseKey(entriesFor("en", namespace));
    expect(placeholdersByBaseKey(entriesFor("es", namespace)), namespace).toEqual(english);
  }
});

test("no message is empty", () => {
  for (const namespace of NAMESPACES) {
    for (const language of LANGUAGES) {
      const empty = [...entriesFor(language, namespace)].filter(([, value]) => value.trim() === "");
      expect(empty, `${language}/${namespace}`).toEqual([]);
    }
  }
});

test("plural messages include every category the language needs", () => {
  for (const namespace of NAMESPACES) {
    for (const language of LANGUAGES) {
      const missing = missingPluralForms(entriesFor(language, namespace), language);
      expect(missing, `${language}/${namespace}`).toEqual([]);
    }
  }
});
