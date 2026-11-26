import type { Subscribable } from "../reactive/subscribable.ts";
import type { LibraryEntry } from "./library-entry.ts";
import type { SongRecord } from "./song-record.ts";

export interface SongReader {
  /** Emits the ordered list on subscribe and after every change; never includes file bytes. */
  watchLibrary(): Subscribable<LibraryEntry[]>;
  get(id: string): Promise<SongRecord | null>;
  readOriginal(id: string): Promise<Uint8Array | null>;
}
