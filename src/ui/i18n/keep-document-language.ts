import type { i18n } from "i18next";

/** Keeps the document's lang attribute equal to the interface language, now and on every change. */
export function keepDocumentLanguage(instance: i18n, target: Document): void {
  const apply = (language: string): void => {
    target.documentElement.lang = language;
  };
  apply(instance.language);
  instance.on("languageChanged", apply);
}
