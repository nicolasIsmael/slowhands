import type { RenderReport } from "@core/viewer/render-report.ts";
import type { ScoreRenderer } from "@core/viewer/score-renderer.ts";

/** A renderer that draws nothing and records what it was asked to do. */
export class RecordingScoreRenderer implements ScoreRenderer<HTMLElement> {
  readonly shown: Uint8Array[] = [];
  readonly zooms: number[] = [];
  refits = 0;
  disposed = 0;
  private readonly report: RenderReport;

  constructor(report: RenderReport = { status: "rendered" }) {
    this.report = report;
  }

  async show(_surface: HTMLElement, scoreXml: Uint8Array): Promise<RenderReport> {
    this.shown.push(scoreXml);
    return this.report;
  }

  async refit(): Promise<void> {
    this.refits += 1;
  }

  async setZoom(factor: number): Promise<void> {
    this.zooms.push(factor);
  }

  dispose(): void {
    this.disposed += 1;
  }
}
