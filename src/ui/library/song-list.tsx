import type { LibraryEntry } from "@core/library/library-entry.ts";
import { SongRow } from "./song-row.tsx";
import type { SongRowActions } from "./song-row-menu.tsx";

export function SongList({
  entries,
  onOpen,
  onRename,
  onDelete,
}: SongRowActions & {
  entries: readonly LibraryEntry[];
  onOpen: (songId: string) => void;
}) {
  return (
    <ul className="grid gap-2">
      {entries.map((entry) => (
        <SongRow
          key={entry.id}
          entry={entry}
          onOpen={onOpen}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
