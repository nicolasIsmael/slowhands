import type { ScoreFormat } from "../library/song-record.ts";

/** What the checks learned about an accepted score. */
export interface ScoreSummary {
  readonly title: string | null;
  readonly composer: string | null;
  readonly format: ScoreFormat;
  /** Hash of the score XML, so a compressed and a plain copy of one score match. */
  readonly contentHash: string;
}
