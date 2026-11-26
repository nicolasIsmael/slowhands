import { MaximizeIcon, MinusIcon, PlusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../primitives/button.tsx";
import type { ZoomControl } from "./use-zoom.ts";

export function ZoomControls({ zoom }: { zoom: ZoomControl }) {
  const { t } = useTranslation("viewer");
  const { level } = zoom;
  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{t("zoom.group")}</legend>
      <Button
        variant="outline"
        aria-label={t("zoom.out")}
        disabled={!level.canZoomOut}
        onClick={zoom.zoomOut}
      >
        <MinusIcon aria-hidden="true" className="size-4" />
      </Button>
      <span aria-live="polite" className="min-w-14 text-center text-sm tabular-nums">
        {level.percent}%
      </span>
      <Button
        variant="outline"
        aria-label={t("zoom.in")}
        disabled={!level.canZoomIn}
        onClick={zoom.zoomIn}
      >
        <PlusIcon aria-hidden="true" className="size-4" />
      </Button>
      <Button variant="outline" disabled={level.isFit} onClick={zoom.fit}>
        <MaximizeIcon aria-hidden="true" className="size-4" />
        {t("zoom.fit")}
      </Button>
    </fieldset>
  );
}
