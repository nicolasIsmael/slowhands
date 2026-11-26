import type { LibraryEntry } from "@core/library/library-entry.ts";
import { useEffect, useState } from "react";
import { useServices } from "../app/services-context.tsx";

export type LibraryState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly entries: readonly LibraryEntry[] }
  | { readonly status: "failed" };

/** The songs in the library, newest activity first, kept up to date as they change. */
export function useLibrary(): LibraryState {
  const { songReader } = useServices();
  const [state, setState] = useState<LibraryState>({ status: "loading" });

  useEffect(
    () =>
      songReader.watchLibrary().subscribe(
        (entries) => setState({ status: "ready", entries }),
        () => setState({ status: "failed" }),
      ),
    [songReader],
  );

  return state;
}
