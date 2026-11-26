import { type AppLanguage, DEFAULT_LANGUAGE, isAppLanguage } from "@core/settings/app-language.ts";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useServices } from "../app/services-context.tsx";

export interface AppLanguageControl {
  language: AppLanguage;
  change: (next: AppLanguage) => Promise<void>;
}

export function useAppLanguage(): AppLanguageControl {
  const { i18n } = useTranslation();
  const { settings } = useServices();
  const change = useCallback(
    async (next: AppLanguage): Promise<void> => {
      await settings.setLanguage(next);
      await i18n.changeLanguage(next);
    },
    [settings, i18n],
  );
  const language = isAppLanguage(i18n.resolvedLanguage) ? i18n.resolvedLanguage : DEFAULT_LANGUAGE;
  return { language, change };
}
