import type { ImportOutcome } from "./import-outcome.ts";

/** What happened to every file of one batch, in the order the files were picked. */
export class ImportSummary {
  readonly outcomes: readonly ImportOutcome[];

  constructor(outcomes: readonly ImportOutcome[]) {
    this.outcomes = outcomes;
  }

  get importedCount(): number {
    return this.count("imported");
  }

  get replacedCount(): number {
    return this.count("replaced");
  }

  get keptBothCount(): number {
    return this.count("kept-both");
  }

  get skippedCount(): number {
    return this.count("skipped");
  }

  get failedCount(): number {
    return this.count("failed");
  }

  /** Songs that were added or changed, which is when the library now deserves to be kept safe. */
  get savedCount(): number {
    return this.importedCount + this.replacedCount + this.keptBothCount;
  }

  /** The song to open right away: only when a single file was picked and it became a song. */
  get songToOpen(): string | null {
    const only = this.outcomes.length === 1 ? this.outcomes[0] : undefined;
    const result = only?.result;
    return result?.kind === "imported" || result?.kind === "replaced" ? result.songId : null;
  }

  private count(kind: ImportOutcome["result"]["kind"]): number {
    return this.outcomes.filter(({ result }) => result.kind === kind).length;
  }
}
