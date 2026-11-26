import { useEffect } from "react";
import type { ZoomControl } from "./use-zoom.ts";

const TYPING_TARGETS = new Set(["INPUT", "SELECT", "TEXTAREA"]);

/** `+` zooms in, `-` zooms out and `0` fits the width, unless the person is typing or using browser zoom. */
export function useZoomKeys(zoom: ZoomControl, enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const onKey = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        TYPING_TARGETS.has(target?.tagName ?? "")
      ) {
        return;
      }
      if (event.key === "+" || event.key === "=") {
        zoom.zoomIn();
      } else if (event.key === "-") {
        zoom.zoomOut();
      } else if (event.key === "0") {
        zoom.fit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, enabled]);
}
