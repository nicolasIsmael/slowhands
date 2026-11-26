import type { LibraryEntry } from "@core/library/library-entry.ts";
import { type SongRowActions, SongRowMenu } from "./song-row-menu.tsx";

/** One song: its name and, when the score names one, its composer, plus its actions menu. */
export function SongRow({
  entry,
  onOpen,
  onRename,
  onDelete,
}: SongRowActions & {
  entry: LibraryEntry;
  onOpen: (songId: string) => void;
}) {
  return (
    <li className="motion-rise flex items-stretch gap-2">
      <button
        type="button"
        onClick={() => onOpen(entry.id)}
        className="flex min-h-14 min-w-0 flex-1 flex-col items-start justify-center gap-0.5 rounded-lg border bg-card px-4 py-2 text-start transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        <span dir="auto" className="font-medium break-words">
          {entry.displayName}
        </span>{" "}
        {entry.composer && (
          <span dir="auto" className="text-sm break-words text-muted-foreground">
            {entry.composer}
          </span>
        )}
      </button>
      <SongRowMenu entry={entry} onRename={onRename} onDelete={onDelete} />
    </li>
  );
}
