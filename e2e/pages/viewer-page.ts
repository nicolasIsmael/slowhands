import type { Locator, Page } from "@playwright/test";

/** The score viewer: the song's name, the drawn score and the messages around it. */
export class ViewerPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  title(name: string): Locator {
    return this.page.getByRole("heading", { name, level: 2 });
  }

  scoreDrawing(): Locator {
    return this.page.locator("section > div svg").first();
  }

  /**
   * Milliseconds from the file input firing its change event (the person choosing the file) to
   * the score appearing on screen.
   */
  async delayUntilDrawn(choose: () => Promise<void>): Promise<number> {
    await this.page.evaluate(() => {
      document.addEventListener(
        "change",
        () => {
          (globalThis as unknown as { __chosenAt: number }).__chosenAt = performance.now();
        },
        { capture: true, once: true },
      );
    });
    await choose();
    await this.page.waitForSelector("section > div svg", { timeout: 60_000 });
    return this.page.evaluate(
      () => performance.now() - (globalThis as unknown as { __chosenAt: number }).__chosenAt,
    );
  }

  /** The width and height of the drawn score on screen, in pixels. */
  async drawingSize(): Promise<{ width: number; height: number }> {
    const box = await this.scoreDrawing().boundingBox();
    return { width: box?.width ?? 0, height: box?.height ?? 0 };
  }

  zoomButton(name: "Zoom in" | "Zoom out" | "Fit to width"): Locator {
    return this.page.getByRole("button", { name });
  }

  zoomPercent(): Locator {
    return this.page.getByRole("group", { name: "Zoom" }).locator("span");
  }

  notice(): Locator {
    return this.page.getByRole("note");
  }

  alert(): Locator {
    return this.page.getByRole("alert");
  }

  backButton(name: "Back to songs" | "Volver a las canciones"): Locator {
    return this.page.getByRole("button", { name });
  }
}
