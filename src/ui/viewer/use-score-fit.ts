import type { ScoreRenderer } from "@core/viewer/score-renderer.ts";
import { type RefObject, useEffect } from "react";

export const RESIZE_SETTLE_MS = 150;

/** Lays the score out again when the width of its surface changes (rotation, window resize). */
export function useScoreFit(
  surface: RefObject<HTMLElement | null>,
  renderer: RefObject<ScoreRenderer<HTMLElement> | null>,
  enabled: boolean,
): void {
  useEffect(() => {
    const element = surface.current;
    if (!enabled || element === null) {
      return;
    }
    let width = element.clientWidth;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (element.clientWidth !== width) {
          width = element.clientWidth;
          void renderer.current?.refit();
        }
      }, RESIZE_SETTLE_MS);
    });
    observer.observe(element);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [surface, renderer, enabled]);
}
