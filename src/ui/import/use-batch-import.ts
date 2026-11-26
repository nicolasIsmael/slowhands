import type { DuplicateDecider, DuplicateDecision } from "@core/import/duplicate-decision.ts";
import { BrowserFileSource } from "@engines/browser-files/browser-file-source.ts";
import { type Dispatch, type RefObject, useCallback, useReducer, useRef } from "react";
import type { Services } from "../app/services.ts";
import { useServices } from "../app/services-context.tsx";
import { IDLE_IMPORT, type ImportAction, type ImportState, importReducer } from "./import-state.ts";

export interface BatchImportControl {
  state: ImportState;
  start: (files: readonly File[]) => Promise<void>;
  /** Answers the question about duplicates; closing the question must answer `skip-all`. */
  decide: (decision: DuplicateDecision) => void;
  dismiss: () => void;
}

type Answer = (decision: DuplicateDecision) => void;

/** Pauses the import with the person's question on screen until `decide` answers it. */
function askThePerson(dispatch: Dispatch<ImportAction>, waiting: RefObject<Answer | null>) {
  const decider: DuplicateDecider = (notices) =>
    new Promise((resolve) => {
      waiting.current = resolve;
      dispatch({ type: "duplicates-found", notices });
    });
  return decider;
}

async function runImport(
  {
    createBatchImport,
    navigation,
    storagePersistence,
  }: Pick<Services, "createBatchImport" | "navigation" | "storagePersistence">,
  files: readonly File[],
  dispatch: Dispatch<ImportAction>,
  decider: DuplicateDecider,
): Promise<void> {
  dispatch({ type: "started", fileNames: files.map((file) => file.name) });
  const sources = files.map((file) => new BrowserFileSource(file));
  const summary = await createBatchImport().run(
    sources,
    (progress) => dispatch({ type: "progress", progress }),
    decider,
  );
  if (summary.savedCount > 0) {
    void storagePersistence.request();
  }
  if (summary.songToOpen === null) {
    dispatch({ type: "finished", summary });
    return;
  }
  dispatch({ type: "dismissed" });
  navigation.openViewer(summary.songToOpen);
}

/** Holds the pending question and answers it, resuming the paused import. */
function useDecision(dispatch: Dispatch<ImportAction>) {
  const waiting = useRef<Answer | null>(null);
  const decide = useCallback(
    (decision: DuplicateDecision) => {
      const answer = waiting.current;
      waiting.current = null;
      dispatch({ type: "duplicates-decided" });
      answer?.(decision);
    },
    [dispatch],
  );
  return { waiting, decide };
}

/** Runs an import for the picked files and tracks what the screen shows while it runs. */
export function useBatchImport(): BatchImportControl {
  const services = useServices();
  const [state, dispatch] = useReducer(importReducer, IDLE_IMPORT);
  const running = useRef(false);
  const { waiting, decide } = useDecision(dispatch);

  const start = useCallback(
    async (files: readonly File[]): Promise<void> => {
      if (running.current || files.length === 0) {
        return;
      }
      running.current = true;
      services.importActivity.begin();
      try {
        await runImport(services, files, dispatch, askThePerson(dispatch, waiting));
      } finally {
        running.current = false;
        services.importActivity.end();
      }
    },
    [services, waiting],
  );

  const dismiss = useCallback(() => dispatch({ type: "dismissed" }), []);
  return { state, start, decide, dismiss };
}
