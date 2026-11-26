import type { RenderReport } from "./render-report.ts";

/**
 * Draws a score. `Surface` is whatever the interface layer draws into, so the core never
 * names a browser type.
 */
export interface ScoreRenderer<Surface> {
  show(surface: Surface, scoreXml: Uint8Array): Promise<RenderReport>;
  /** Lays the score out again for the surface's current width. */
  refit(): Promise<void>;
  /** Draws the score at a zoom factor, where 1 fits the width. */
  setZoom(factor: number): Promise<void>;
  dispose(): void;
}
