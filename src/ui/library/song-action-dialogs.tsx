import type { LibraryEntry } from "@core/library/library-entry.ts";
import { DeleteConfirmDialog } from "./delete-confirm-dialog.tsx";
import { RenameDialog } from "./rename-dialog.tsx";

export interface SongActionTarget {
  readonly kind: "rename" | "delete";
  readonly entry: LibraryEntry;
}

/** The dialog for the action the person chose from a song's menu, if any. */
export function SongActionDialogs({
  target,
  onClose,
}: {
  target: SongActionTarget | null;
  onClose: () => void;
}) {
  if (target === null) {
    return null;
  }
  const Dialog = target.kind === "rename" ? RenameDialog : DeleteConfirmDialog;
  return <Dialog key={target.entry.id} entry={target.entry} onClose={onClose} />;
}
