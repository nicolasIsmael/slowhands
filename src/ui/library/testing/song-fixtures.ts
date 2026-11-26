import type { LibraryEntry } from "@core/library/library-entry.ts";
import { createNewSong } from "@core/library/new-song.ts";
import { InMemorySongStore } from "../../testing/in-memory-song-store.ts";

export function entryOf(id: string, displayName: string): LibraryEntry {
  return { id, displayName, composer: null, sourceFileName: `${id}.xml`, activityAt: 1 };
}

/** A library holding one song, for tests of the actions that change a song. */
export async function storeWith(id: string, title: string): Promise<InMemorySongStore> {
  const store = new InMemorySongStore();
  const summary = { title, composer: null, format: "musicxml", contentHash: id } as const;
  const song = createNewSong({ summary, fileName: `${id}.xml`, byteSize: 1, id, now: 1 });
  await store.add(song, new Uint8Array(1));
  return store;
}
