export interface Catalog {
  [key: string]: string | Catalog;
}

const PLURAL_SUFFIX = /^(.*)_(zero|one|two|few|many|other)$/;

export function flattenCatalog(catalog: Catalog, prefix = ""): Map<string, string> {
  const entries = new Map<string, string>();
  for (const [key, value] of Object.entries(catalog)) {
    const path = prefix === "" ? key : `${prefix}.${key}`;
    if (typeof value === "string") {
      entries.set(path, value);
    } else {
      for (const [innerKey, innerValue] of flattenCatalog(value, path)) {
        entries.set(innerKey, innerValue);
      }
    }
  }
  return entries;
}

export function placeholdersOf(text: string): string[] {
  const names = [...text.matchAll(/{{\s*([\w.]+)\s*}}/g)].map((match) => match[1] ?? "");
  return [...new Set(names)].sort();
}

export function baseKey(key: string): string {
  return PLURAL_SUFFIX.exec(key)?.[1] ?? key;
}

export function pluralCategoriesFor(language: string): string[] {
  return new Intl.PluralRules(language).resolvedOptions().pluralCategories;
}

export function missingPluralForms(entries: Map<string, string>, language: string): string[] {
  const required = pluralCategoriesFor(language);
  const pluralBases = new Set(
    [...entries.keys()].filter((key) => PLURAL_SUFFIX.test(key)).map(baseKey),
  );
  return [...pluralBases].flatMap((base) =>
    required.filter((category) => !entries.has(`${base}_${category}`)).map((c) => `${base}_${c}`),
  );
}

export function placeholdersByBaseKey(entries: Map<string, string>): Map<string, string[]> {
  const grouped = new Map<string, Set<string>>();
  for (const [key, value] of entries) {
    const names = grouped.get(baseKey(key)) ?? new Set<string>();
    for (const name of placeholdersOf(value)) {
      names.add(name);
    }
    grouped.set(baseKey(key), names);
  }
  return new Map([...grouped].map(([key, names]) => [key, [...names].sort()]));
}
