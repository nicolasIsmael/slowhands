import type { ScoreNotice } from "../score/score-notice.ts";

/** A score ready to draw: plain score XML plus anything the person should be told about it. */
export interface PreparedScore {
  readonly xml: Uint8Array;
  readonly notices: readonly ScoreNotice[];
}
