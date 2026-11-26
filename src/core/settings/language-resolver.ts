import { type AppLanguage, DEFAULT_LANGUAGE, isAppLanguage } from "./app-language.ts";

export class LanguageResolver {
  resolve(saved: AppLanguage | null, deviceLanguages: readonly string[]): AppLanguage {
    if (saved !== null) {
      return saved;
    }
    for (const tag of deviceLanguages) {
      const base = this.baseLanguage(tag);
      if (isAppLanguage(base)) {
        return base;
      }
    }
    return DEFAULT_LANGUAGE;
  }

  private baseLanguage(tag: string): string {
    return tag.toLowerCase().split(/[-_]/)[0] ?? "";
  }
}
