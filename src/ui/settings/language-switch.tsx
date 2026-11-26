import { isAppLanguage, SUPPORTED_LANGUAGES } from "@core/settings/app-language.ts";
import { useId } from "react";
import { useTranslation } from "react-i18next";
import { useAppLanguage } from "./use-app-language.ts";

export function LanguageSwitch() {
  const { t } = useTranslation();
  const { language, change } = useAppLanguage();
  const selectId = useId();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={selectId} className="text-sm text-muted-foreground">
        {t("language.label")}
      </label>
      <select
        id={selectId}
        value={language}
        onChange={(event) => {
          const chosen = event.target.value;
          if (isAppLanguage(chosen)) {
            void change(chosen);
          }
        }}
        className="min-h-11 rounded-md border border-input bg-card px-3 text-sm"
      >
        {SUPPORTED_LANGUAGES.map((code) => (
          <option key={code} value={code}>
            {t(`language.option.${code}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
