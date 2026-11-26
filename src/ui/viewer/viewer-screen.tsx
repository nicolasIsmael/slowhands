import { ArrowLeftIcon } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useServices } from "../app/services-context.tsx";
import { Button } from "../primitives/button.tsx";
import { useScoreFit } from "./use-score-fit.ts";
import { useScoreViewer } from "./use-score-viewer.ts";
import { useZoom } from "./use-zoom.ts";
import { useZoomKeys } from "./use-zoom-keys.ts";
import { NOTICE_KEYS, VIEW_FAILURE_KEYS } from "./view-messages.ts";
import type { ViewerState } from "./viewer-state.ts";
import { ZoomControls } from "./zoom-controls.tsx";

function ViewerStatus({ state }: { state: ViewerState }) {
  const { t } = useTranslation("viewer");
  if (state.status === "loading") {
    return <p role="status">{t("loading")}</p>;
  }
  if (state.status === "failed") {
    const key = VIEW_FAILURE_KEYS[state.code];
    return (
      <div role="alert" className="grid gap-1 text-destructive">
        <p className="font-medium">{t(`${key}.title`)}</p>
        <p className="text-sm">{t(`${key}.hint`)}</p>
      </div>
    );
  }
  return (
    <>
      {state.notices.map((notice) => (
        <p key={notice} role="note" className="rounded-md bg-muted p-3 text-sm">
          {t(NOTICE_KEYS[notice])}
        </p>
      ))}
    </>
  );
}

export function ViewerScreen({ songId }: { songId: string }) {
  const { t } = useTranslation("viewer");
  const { navigation } = useServices();
  const surface = useRef<HTMLDivElement>(null);
  const { state, renderer } = useScoreViewer(songId, surface);
  const ready = state.status === "ready";
  const zoom = useZoom(renderer);
  useScoreFit(surface, renderer, ready);
  useZoomKeys(zoom, ready);

  return (
    <section className="motion-fade flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigation.showList()}>
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          {t("back")}
        </Button>
        <h2 dir="auto" className="min-w-0 truncate text-lg font-semibold">
          {state.status === "ready" ? state.title : null}
        </h2>
      </header>
      <ViewerStatus state={state} />
      {ready && <ZoomControls zoom={zoom} />}
      <div ref={surface} className="overflow-x-hidden rounded-md bg-white" />
    </section>
  );
}
