import { useCallback, useMemo, useState } from "react";
import type { SongActionTarget } from "./song-action-dialogs.tsx";
import type { SongRowActions } from "./song-row-menu.tsx";

/** Which song action is waiting for the person (a rename form or a delete confirmation). */
export function useSongActions() {
  const [target, setTarget] = useState<SongActionTarget | null>(null);
  const actions = useMemo<SongRowActions>(
    () => ({
      onRename: (entry) => setTarget({ kind: "rename", entry }),
      onDelete: (entry) => setTarget({ kind: "delete", entry }),
    }),
    [],
  );
  const close = useCallback(() => setTarget(null), []);
  return { target, actions, close };
}
