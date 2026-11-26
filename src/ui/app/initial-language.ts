import type { AppLanguage } from "@core/settings/app-language.ts";
import { LanguageResolver } from "@core/settings/language-resolver.ts";
import type { SettingsRepository } from "@core/settings/settings-repository.ts";

export const SAVED_LANGUAGE_TIMEOUT_MS = 1500;

function savedLanguageOrNull(
  settings: SettingsRepository,
  timeoutMs: number,
): Promise<AppLanguage | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    settings.getLanguage().then(
      (saved) => {
        clearTimeout(timer);
        resolve(saved);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

/** The saved choice if it can be read in time, otherwise the device language. */
export async function loadInitialLanguage(
  settings: SettingsRepository,
  deviceLanguages: readonly string[],
  timeoutMs: number = SAVED_LANGUAGE_TIMEOUT_MS,
): Promise<AppLanguage> {
  const saved = await savedLanguageOrNull(settings, timeoutMs);
  return new LanguageResolver().resolve(saved, deviceLanguages);
}
