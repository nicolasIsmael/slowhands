import { type AppLanguage, DEFAULT_LANGUAGE } from "@core/settings/app-language.ts";
import i18next, { type i18n } from "i18next";
import { NAMESPACES, resources } from "./resources.ts";

/** Builds an instance that is ready immediately: every catalog is bundled with the app. */
export function createI18n(language: AppLanguage): i18n {
  const instance = i18next.createInstance();
  void instance.init({
    resources,
    lng: language,
    fallbackLng: DEFAULT_LANGUAGE,
    ns: [...NAMESPACES],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return instance;
}
