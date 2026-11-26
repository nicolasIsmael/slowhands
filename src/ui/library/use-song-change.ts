import { useCallback, useState } from "react";

/** Runs a change to one song; it reports `failed` when the change could not be saved. */
export function useSongChange(onDone: () => void) {
  const [failed, setFailed] = useState(false);
  const run = useCallback(
    async (change: () => Promise<void>): Promise<void> => {
      try {
        await change();
        onDone();
      } catch {
        setFailed(true);
      }
    },
    [onDone],
  );
  return { failed, run };
}
