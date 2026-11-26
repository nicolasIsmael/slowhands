import type { AppLanguage } from "@core/settings/app-language.ts";
import type { SettingsRepository } from "@core/settings/settings-repository.ts";

export class InMemorySettingsRepository implements SettingsRepository {
  private language: AppLanguage | null;

  constructor(language: AppLanguage | null = null) {
    this.language = language;
  }

  async getLanguage(): Promise<AppLanguage | null> {
    return this.language;
  }

  async setLanguage(language: AppLanguage): Promise<void> {
    this.language = language;
  }
}
