import type { ScoreFormat } from "../library/song-record.ts";
import type { PreparedScore } from "./prepared-score.ts";

/** Unpacks a stored original and checks it for notation the renderer cannot draw. */
export interface ScoreSourcePreparer {
  prepare(bytes: Uint8Array, format: ScoreFormat): Promise<PreparedScore>;
}
