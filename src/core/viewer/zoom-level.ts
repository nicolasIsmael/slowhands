export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 3;
const STEP = 0.25;
const FIT = 1;

const clamp = (factor: number): number => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, factor));

/** How large the score is drawn: 1 fits the width of the screen. Each change gives a new level. */
export class ZoomLevel {
  readonly factor: number;

  private constructor(factor: number) {
    this.factor = factor;
  }

  static fit(): ZoomLevel {
    return new ZoomLevel(FIT);
  }

  get isFit(): boolean {
    return this.factor === FIT;
  }

  get canZoomIn(): boolean {
    return this.factor < MAX_ZOOM;
  }

  get canZoomOut(): boolean {
    return this.factor > MIN_ZOOM;
  }

  get percent(): number {
    return Math.round(this.factor * 100);
  }

  zoomIn(): ZoomLevel {
    return new ZoomLevel(clamp(this.factor + STEP));
  }

  zoomOut(): ZoomLevel {
    return new ZoomLevel(clamp(this.factor - STEP));
  }

  toFit(): ZoomLevel {
    return ZoomLevel.fit();
  }
}
