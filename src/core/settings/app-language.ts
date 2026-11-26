export const SUPPORTED_LANGUAGES = ["en", "es"] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: AppLanguage = "en";

export function isAppLanguage(value: unknown): value is AppLanguage {
  return SUPPORTED_LANGUAGES.some((language) => language === value);
}
