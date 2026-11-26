import type { SongRecord } from "./song-record.ts";

/** Every write is atomic: the record and the original bytes are stored together or not at all. */
export interface SongWriter {
  add(song: SongRecord, bytes: Uint8Array): Promise<void>;
  replace(id: string, song: SongRecord, bytes: Uint8Array): Promise<void>;
  rename(id: string, displayName: string): Promise<void>;
  markOpened(id: string, at: number): Promise<void>;
  remove(id: string): Promise<void>;
}
