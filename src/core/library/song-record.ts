export type ScoreFormat = "musicxml" | "mxl";

/** The persisted description of one imported song; the score bytes are stored separately. */
export interface SongRecord {
  readonly id: string;
  readonly displayName: string;
  readonly isRenamed: boolean;
  readonly title: string | null;
  readonly composer: string | null;
  readonly sourceFileName: string;
  readonly format: ScoreFormat;
  readonly byteSize: number;
  readonly contentHash: string;
  readonly identityKey: string;
  readonly addedAt: number;
  readonly lastOpenedAt: number | null;
  readonly activityAt: number;
  readonly extractorVersion: number;
}
