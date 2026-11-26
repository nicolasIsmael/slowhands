import type { SongReader } from "@core/library/song-reader.ts";
import type { ScoreRenderer } from "@core/viewer/score-renderer.ts";
import type { ScoreSourcePreparer } from "@core/viewer/score-source-preparer.ts";
import { failed, type ViewerState } from "./viewer-state.ts";

export interface ViewSongParts {
  songReader: SongReader;
  preparer: ScoreSourcePreparer;
  renderer: ScoreRenderer<HTMLElement>;
}

/** Reads a stored song, prepares its score and draws it; says what happened instead of throwing. */
export async function viewSong(
  { songReader, preparer, renderer }: ViewSongParts,
  surface: HTMLElement,
  songId: string,
): Promise<ViewerState> {
  const song = await songReader.get(songId);
  const bytes = song ? await songReader.readOriginal(songId) : null;
  if (!song || !bytes) {
    return failed("song-not-found");
  }
  let prepared: Awaited<ReturnType<ScoreSourcePreparer["prepare"]>>;
  try {
    prepared = await preparer.prepare(bytes, song.format);
  } catch {
    return failed("score-unreadable");
  }
  const report = await renderer.show(surface, prepared.xml);
  return report.status === "rendered"
    ? { status: "ready", title: song.displayName, notices: prepared.notices }
    : failed(report.code);
}
