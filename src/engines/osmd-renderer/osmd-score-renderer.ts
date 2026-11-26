import type { RenderReport } from "@core/viewer/render-report.ts";
import type { ScoreRenderer } from "@core/viewer/score-renderer.ts";
import type { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { decodeXmlText } from "../score-parsing/xml-text-decoder.ts";
import { yieldToBrowser } from "./yield-to-browser.ts";

/** Draws scores with OpenSheetMusicDisplay, loaded the first time a score is shown. */
export class OsmdScoreRenderer implements ScoreRenderer<HTMLElement> {
  private display: OpenSheetMusicDisplay | null = null;

  async show(surface: HTMLElement, scoreXml: Uint8Array): Promise<RenderReport> {
    this.dispose();
    try {
      const { OpenSheetMusicDisplay: Display } = await import("opensheetmusicdisplay");
      const display = new Display(surface, { autoResize: false, backend: "svg", drawTitle: true });
      await yieldToBrowser();
      await display.load(decodeXmlText(scoreXml));
      display.zoom = 1;
      display.render();
      this.display = display;
      return { status: "rendered" };
    } catch {
      return { status: "failed", code: "render-failed" };
    }
  }

  async refit(): Promise<void> {
    await yieldToBrowser();
    this.display?.render();
  }

  async setZoom(factor: number): Promise<void> {
    if (this.display === null) {
      return;
    }
    this.display.zoom = factor;
    await yieldToBrowser();
    this.display.render();
  }

  dispose(): void {
    this.display?.clear();
    this.display = null;
  }
}
