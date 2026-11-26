import type { ScoreRenderer } from "@core/viewer/score-renderer.ts";
import { type RefObject, useEffect, useRef, useState } from "react";
import { useServices } from "../app/services-context.tsx";
import { viewSong } from "./view-song.ts";
import { LOADING, type ViewerState } from "./viewer-state.ts";

export interface ScoreViewer {
  state: ViewerState;
  /** The renderer drawing this song, for controls that change how it is drawn. */
  renderer: RefObject<ScoreRenderer<HTMLElement> | null>;
}

/** Loads and draws one song into the given surface, and tells the screen how it is going. */
export function useScoreViewer(
  songId: string,
  surface: RefObject<HTMLElement | null>,
): ScoreViewer {
  const { songReader, preparer, createRenderer } = useServices();
  const [state, setState] = useState<ViewerState>(LOADING);
  const renderer = useRef<ScoreRenderer<HTMLElement> | null>(null);

  useEffect(() => {
    const element = surface.current;
    if (element === null) {
      return;
    }
    let current = true;
    const drawing = createRenderer();
    renderer.current = drawing;
    setState(LOADING);
    viewSong({ songReader, preparer, renderer: drawing }, element, songId).then((next) => {
      if (current) {
        setState(next);
      }
    });
    return () => {
      current = false;
      renderer.current = null;
      drawing.dispose();
    };
  }, [songId, surface, songReader, preparer, createRenderer]);

  return { state, renderer };
}
