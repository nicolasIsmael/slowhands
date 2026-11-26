import { expect, test } from "vitest";
import { createI18n } from "./create-i18n.ts";
import { keepDocumentLanguage } from "./keep-document-language.ts";

test("sets the document language immediately", () => {
  keepDocumentLanguage(createI18n("es"), document);
  expect(document.documentElement.lang).toBe("es");
});

test("updates the document language when the interface language changes", async () => {
  const instance = createI18n("en");
  keepDocumentLanguage(instance, document);
  await instance.changeLanguage("es");
  expect(document.documentElement.lang).toBe("es");
});
