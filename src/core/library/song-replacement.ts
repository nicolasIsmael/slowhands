import type { SongRecord } from "./song-record.ts";

/**
 * The record that replaces `existing` with a freshly imported score: same song, new score, and
 * the most recent activity. A name the person chose is kept; otherwise the new title is used.
 */
export function replacementFor(existing: SongRecord, fresh: SongRecord): SongRecord {
  return {
    ...fresh,
    id: existing.id,
    displayName: existing.isRenamed ? existing.displayName : fresh.displayName,
    isRenamed: existing.isRenamed,
    lastOpenedAt: null,
  };
}
