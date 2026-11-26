import { useTranslation } from "react-i18next";
import { Button } from "../primitives/button.tsx";
import { useAppUpdate } from "./use-app-update.ts";

/** Offers a waiting update. It never applies by itself, and it waits while an import runs. */
export function UpdatePrompt() {
  const { t } = useTranslation("pwa");
  const { available, mustWait, apply } = useAppUpdate();
  if (!available) {
    return null;
  }
  return (
    <section
      aria-label={t("update.available")}
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3"
    >
      <div role="status" className="grid gap-0.5 text-sm">
        <p className="font-medium">{t("update.available")}</p>
        {mustWait && <p className="text-muted-foreground">{t("update.waitForImport")}</p>}
      </div>
      <Button onClick={apply} disabled={mustWait}>
        {t("update.apply")}
      </Button>
    </section>
  );
}
