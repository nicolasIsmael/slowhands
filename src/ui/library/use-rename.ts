import type { LibraryEntry } from "@core/library/library-entry.ts";
import { normalizeSongName } from "@core/library/song-rename.ts";
import { type FormEvent, useState } from "react";
import { useServices } from "../app/services-context.tsx";
import { useSongChange } from "./use-song-change.ts";

/** The state of the rename form: what is typed, whether it can be saved, and how to save it. */
export function useRename(entry: LibraryEntry, onDone: () => void) {
  const { songWriter } = useServices();
  const [value, setValue] = useState(entry.displayName);
  const { failed, run } = useSongChange(onDone);
  const name = normalizeSongName(value);

  const save = (event: FormEvent): void => {
    event.preventDefault();
    if (name === null) {
      return;
    }
    void run(async () => {
      if (name !== entry.displayName) {
        await songWriter.rename(entry.id, name);
      }
    });
  };

  return { value, setValue, failed, canSave: name !== null, save };
}
