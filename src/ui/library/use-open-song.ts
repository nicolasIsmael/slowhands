import { useCallback } from "react";
import { useServices } from "../app/services-context.tsx";

/** Opens a song in the viewer and remembers that it was just opened, so it moves to the top. */
export function useOpenSong(): (songId: string) => void {
  const { songWriter, clock, navigation } = useServices();
  return useCallback(
    (songId: string) => {
      songWriter.markOpened(songId, clock.now()).catch(() => {});
      navigation.openViewer(songId);
    },
    [songWriter, clock, navigation],
  );
}
