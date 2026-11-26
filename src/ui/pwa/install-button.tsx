import { useTranslation } from "react-i18next";
import { useServices } from "../app/services-context.tsx";
import { Button } from "../primitives/button.tsx";
import { useFlag } from "./use-flag.ts";

/** Offers to install the app, only while the browser is ready to do it. */
export function InstallButton() {
  const { t } = useTranslation("pwa");
  const { installation } = useServices();
  const canInstall = useFlag(installation.canInstall);
  if (!canInstall) {
    return null;
  }
  return (
    <Button variant="outline" onClick={() => void installation.install()}>
      {t("install.button")}
    </Button>
  );
}
