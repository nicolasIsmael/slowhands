import type { Locator, Page } from "@playwright/test";

interface Stopwatch {
  chosenAt?: number;
  explainedAt?: number;
}

/** The dialog that shows an import's progress and then its single summary. */
export class ImportDialog {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  heading(name: string): Locator {
    return this.page.getByRole("dialog").getByRole("heading", { name });
  }

  message(text: string): Locator {
    return this.page.getByRole("dialog").getByText(text, { exact: true });
  }

  closeButton(name: "Close" | "Cerrar"): Locator {
    return this.page.getByRole("button", { name });
  }

  /**
   * Milliseconds from the file input firing its change event (the person choosing the file) to
   * the explanation appearing. Moving a big test file into the browser is not counted.
   */
  async explanationDelay(text: string, choose: () => Promise<void>): Promise<number> {
    await this.page.evaluate(() => {
      document.addEventListener(
        "change",
        () => {
          (globalThis as unknown as { __stopwatch: Stopwatch }).__stopwatch = {
            chosenAt: performance.now(),
          };
        },
        { capture: true, once: true },
      );
    });
    await choose();
    await this.page.waitForFunction(
      (expected) => {
        const watch = (globalThis as unknown as { __stopwatch?: Stopwatch }).__stopwatch;
        // biome-ignore lint/performance/useDomNodeTextContent: only text the person can see counts
        if (watch && document.body.innerText.includes(expected)) {
          watch.explainedAt ??= performance.now();
          return true;
        }
        return false;
      },
      text,
      { timeout: 10_000, polling: "raf" },
    );
    return this.page.evaluate(() => {
      const watch = (globalThis as unknown as { __stopwatch: Stopwatch }).__stopwatch;
      return (watch.explainedAt ?? 0) - (watch.chosenAt ?? 0);
    });
  }
}
