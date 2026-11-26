import type { AppLanguage } from "./app-language.ts";

export interface SettingsRepository {
  getLanguage(): Promise<AppLanguage | null>;
  setLanguage(language: AppLanguage): Promise<void>;
}
