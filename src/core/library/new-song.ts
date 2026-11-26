import type { ScoreSummary } from "../score/score-summary.ts";
import { identityKeyFor } from "./song-identity.ts";
import type { SongRecord } from "./song-record.ts";

/** The version of the rules that read a title and composer out of a score. */
export const EXTRACTOR_VERSION = 1;

export interface NewSongInput {
  readonly summary: ScoreSummary;
  readonly fileName: string;
  readonly byteSize: number;
  readonly id: string;
  readonly now: number;
}

export function fileNameStem(fileName: string): string {
  const stem = fileName.replace(/\.[^./\\]+$/, "");
  return stem === "" ? fileName : stem;
}

export function createNewSong({ summary, fileName, byteSize, id, now }: NewSongInput): SongRecord {
  return {
    id,
    displayName: summary.title ?? fileNameStem(fileName),
    isRenamed: false,
    title: summary.title,
    composer: summary.composer,
    sourceFileName: fileName,
    format: summary.format,
    byteSize,
    contentHash: summary.contentHash,
    identityKey: identityKeyFor({ title: summary.title, composer: summary.composer, fileName }),
    addedAt: now,
    lastOpenedAt: null,
    activityAt: now,
    extractorVersion: EXTRACTOR_VERSION,
  };
}
