import type { ScoreNotice } from "@core/score/score-notice.ts";
import type { ViewFailureCode } from "@core/viewer/view-failure-code.ts";

/** The message key (without `.title` or `.hint`) for each way showing a song can fail. */
export const VIEW_FAILURE_KEYS = {
  "song-not-found": "failure.songNotFound",
  "score-unreadable": "failure.scoreUnreadable",
  "render-failed": "failure.renderFailed",
} as const satisfies Record<ViewFailureCode, `failure.${string}`>;

export const NOTICE_KEYS = {
  "some-symbols-not-displayed": "notice.someSymbolsNotDisplayed",
} as const satisfies Record<ScoreNotice, `notice.${string}`>;
