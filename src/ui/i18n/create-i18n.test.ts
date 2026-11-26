import { expect, test } from "vitest";
import { createI18n } from "./create-i18n.ts";

test("translates immediately in the requested language", () => {
  expect(createI18n("es").t("language.label")).toBe("Idioma");
  expect(createI18n("en").t("language.label")).toBe("Language");
});

test("switches language without loading anything", async () => {
  const instance = createI18n("en");
  await instance.changeLanguage("es");
  expect(instance.t("language.label")).toBe("Idioma");
});
