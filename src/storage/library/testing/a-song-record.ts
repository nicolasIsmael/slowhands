import type { SongRecord } from "@core/library/song-record.ts";

/** A complete song record for tests; override only what the test cares about. */
export function aSongRecord(overrides: Partial<SongRecord> = {}): SongRecord {
  return {
    id: "song-1",
    displayName: "Moonlight",
    isRenamed: false,
    title: "Moonlight",
    composer: "Beethoven",
    sourceFileName: "moonlight.musicxml",
    format: "musicxml",
    byteSize: 3,
    contentHash: "hash-1",
    identityKey: "score:moonlight\u0000beethoven",
    addedAt: 1000,
    lastOpenedAt: null,
    activityAt: 1000,
    extractorVersion: 1,
    ...overrides,
  };
}
