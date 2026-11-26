import type { LibraryEntry } from "@core/library/library-entry.ts";
import { recordOpening } from "@core/library/song-opening.ts";
import type { SongReader } from "@core/library/song-reader.ts";
import type { SongRecord } from "@core/library/song-record.ts";
import type { SongWriter } from "@core/library/song-writer.ts";
import type { Subscribable } from "@core/reactive/subscribable.ts";

interface StoredSong {
  record: SongRecord;
  bytes: Uint8Array;
}

/** A song library held in memory, for tests of screens that read and write songs. */
export class InMemorySongStore implements SongReader, SongWriter {
  private readonly songs = new Map<string, StoredSong>();
  private readonly listeners = new Set<() => void>();

  watchLibrary(): Subscribable<LibraryEntry[]> {
    return {
      subscribe: (onValue) => {
        const emit = (): void => onValue(this.entries());
        this.listeners.add(emit);
        emit();
        return () => {
          this.listeners.delete(emit);
        };
      },
    };
  }

  async get(id: string): Promise<SongRecord | null> {
    return this.songs.get(id)?.record ?? null;
  }

  async readOriginal(id: string): Promise<Uint8Array | null> {
    return this.songs.get(id)?.bytes ?? null;
  }

  async add(song: SongRecord, bytes: Uint8Array): Promise<void> {
    this.songs.set(song.id, { record: song, bytes });
    this.changed();
  }

  async replace(id: string, song: SongRecord, bytes: Uint8Array): Promise<void> {
    this.songs.set(id, { record: { ...song, id }, bytes });
    this.changed();
  }

  async rename(id: string, displayName: string): Promise<void> {
    this.update(id, (song) => ({ ...song, displayName, isRenamed: true }));
  }

  async markOpened(id: string, at: number): Promise<void> {
    this.update(id, (song) => recordOpening(song, at));
  }

  async remove(id: string): Promise<void> {
    this.songs.delete(id);
    this.changed();
  }

  records(): SongRecord[] {
    return [...this.songs.values()].map((stored) => stored.record);
  }

  private update(id: string, change: (song: SongRecord) => SongRecord): void {
    const stored = this.songs.get(id);
    if (stored) {
      this.songs.set(id, { ...stored, record: change(stored.record) });
      this.changed();
    }
  }

  private entries(): LibraryEntry[] {
    return this.records()
      .sort((a, b) => b.activityAt - a.activityAt)
      .map(({ id, displayName, composer, sourceFileName, activityAt }) => ({
        id,
        displayName,
        composer,
        sourceFileName,
        activityAt,
      }));
  }

  private changed(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}
