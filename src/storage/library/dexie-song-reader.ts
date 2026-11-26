import type { LibraryEntry } from "@core/library/library-entry.ts";
import type { SongReader } from "@core/library/song-reader.ts";
import type { SongRecord } from "@core/library/song-record.ts";
import type { Subscribable } from "@core/reactive/subscribable.ts";
import { liveQuery } from "dexie";
import type { SlowHandsDatabase } from "../database/slow-hands-database.ts";

const toEntry = ({ id, displayName, composer, sourceFileName, activityAt }: SongRecord) => ({
  id,
  displayName,
  composer,
  sourceFileName,
  activityAt,
});

export class DexieSongReader implements SongReader {
  private readonly database: SlowHandsDatabase;

  constructor(database: SlowHandsDatabase) {
    this.database = database;
  }

  watchLibrary(): Subscribable<LibraryEntry[]> {
    return {
      subscribe: (onValue, onError) => {
        const subscription = liveQuery(() => this.listEntries()).subscribe({
          next: onValue,
          error: onError,
        });
        return () => subscription.unsubscribe();
      },
    };
  }

  async get(id: string): Promise<SongRecord | null> {
    return (await this.database.songs.get(id)) ?? null;
  }

  async readOriginal(id: string): Promise<Uint8Array | null> {
    const row = await this.database.scoreFiles.get(id);
    return row ? new Uint8Array(row.bytes) : null;
  }

  private async listEntries(): Promise<LibraryEntry[]> {
    const songs = await this.database.songs.orderBy("activityAt").reverse().toArray();
    return songs.map(toEntry);
  }
}
