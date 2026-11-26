import type { ScoreRenderer } from "@core/viewer/score-renderer.ts";
import { ZoomLevel } from "@core/viewer/zoom-level.ts";
import { type RefObject, useCallback, useState } from "react";

export interface ZoomControl {
  level: ZoomLevel;
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
}

/** The zoom the person has chosen, applied to the renderer each time it changes. */
export function useZoom(renderer: RefObject<ScoreRenderer<HTMLElement> | null>): ZoomControl {
  const [level, setLevel] = useState(ZoomLevel.fit());

  const change = useCallback(
    (next: ZoomLevel) => {
      setLevel(next);
      void renderer.current?.setZoom(next.factor);
    },
    [renderer],
  );

  return {
    level,
    zoomIn: () => change(level.zoomIn()),
    zoomOut: () => change(level.zoomOut()),
    fit: () => change(level.toFit()),
  };
}
