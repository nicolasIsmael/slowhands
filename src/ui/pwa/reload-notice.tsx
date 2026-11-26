import { useTranslation } from "react-i18next";
import { useServices } from "../app/services-context.tsx";
import { Button } from "../primitives/button.tsx";
import { useFlag } from "./use-flag.ts";

/** Shown after another tab upgraded the storage: this tab cannot keep working until reloaded. */
export function ReloadNotice() {
  const { t } = useTranslation("pwa");
  const { supersession, reloadPage } = useServices();
  const superseded = useFlag(supersession.superseded);
  if (!superseded) {
    return null;
  }
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive bg-card p-3"
    >
      <p className="text-sm font-medium">{t("reload.message")}</p>
      <Button onClick={reloadPage}>{t("reload.action")}</Button>
    </div>
  );
}
