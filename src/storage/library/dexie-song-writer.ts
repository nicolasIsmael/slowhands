import { exactBuffer } from "@core/bytes/exact-buffer.ts";
import { recordOpening } from "@core/library/song-opening.ts";
import type { SongRecord } from "@core/library/song-record.ts";
import type { SongWriter } from "@core/library/song-writer.ts";
import type { SlowHandsDatabase } from "../database/slow-hands-database.ts";
import { toStorageFailure } from "./storage-error-mapping.ts";

/** Writes songs and their original files together, so a song never exists half saved. */
export class DexieSongWriter implements SongWriter {
  private readonly database: SlowHandsDatabase;

  constructor(database: SlowHandsDatabase) {
    this.database = database;
  }

  add(song: SongRecord, bytes: Uint8Array): Promise<void> {
    return this.inTransaction(async () => {
      await this.database.songs.add(song);
      await this.database.scoreFiles.put({ songId: song.id, bytes: exactBuffer(bytes) });
    });
  }

  replace(id: string, song: SongRecord, bytes: Uint8Array): Promise<void> {
    return this.inTransaction(async () => {
      await this.database.songs.put({ ...song, id });
      await this.database.scoreFiles.put({ songId: id, bytes: exactBuffer(bytes) });
    });
  }

  rename(id: string, displayName: string): Promise<void> {
    return this.inTransaction(async () => {
      await this.database.songs.update(id, { displayName, isRenamed: true });
    });
  }

  markOpened(id: string, at: number): Promise<void> {
    return this.inTransaction(async () => {
      const song = await this.database.songs.get(id);
      if (song) {
        await this.database.songs.put(recordOpening(song, at));
      }
    });
  }

  remove(id: string): Promise<void> {
    return this.inTransaction(async () => {
      await this.database.songs.delete(id);
      await this.database.scoreFiles.delete(id);
    });
  }

  private async inTransaction(work: () => Promise<void>): Promise<void> {
    try {
      await this.database.transaction("rw", [this.database.songs, this.database.scoreFiles], work);
    } catch (error) {
      throw toStorageFailure(error);
    }
  }
}
