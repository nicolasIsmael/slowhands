import type { SongRecord } from "./song-record.ts";

export type DuplicateReason = "same-content" | "same-identity";

export interface DuplicateMatch {
  readonly existing: SongRecord;
  readonly reason: DuplicateReason;
}
