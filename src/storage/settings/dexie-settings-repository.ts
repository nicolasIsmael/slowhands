import { type AppLanguage, isAppLanguage } from "@core/settings/app-language.ts";
import type { SettingsRepository } from "@core/settings/settings-repository.ts";
import type { SlowHandsDatabase } from "../database/slow-hands-database.ts";

const LANGUAGE_KEY = "language";

export class DexieSettingsRepository implements SettingsRepository {
  private readonly database: SlowHandsDatabase;

  constructor(database: SlowHandsDatabase) {
    this.database = database;
  }

  async getLanguage(): Promise<AppLanguage | null> {
    const row = await this.database.settings.get(LANGUAGE_KEY);
    return row && isAppLanguage(row.value) ? row.value : null;
  }

  async setLanguage(language: AppLanguage): Promise<void> {
    await this.database.settings.put({ key: LANGUAGE_KEY, value: language });
  }
}
