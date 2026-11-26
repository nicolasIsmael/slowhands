import type { SongRecord } from "./song-record.ts";

/** The song as it is after being opened: it counts as the most recent activity. */
export function recordOpening(song: SongRecord, at: number): SongRecord {
  return { ...song, lastOpenedAt: at, activityAt: Math.max(song.addedAt, at) };
}
