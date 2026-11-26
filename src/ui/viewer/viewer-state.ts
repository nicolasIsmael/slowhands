import type { ScoreNotice } from "@core/score/score-notice.ts";
import type { ViewFailureCode } from "@core/viewer/view-failure-code.ts";

export type ViewerState =
  | { readonly status: "loading" }
  | { readonly status: "ready"; readonly title: string; readonly notices: readonly ScoreNotice[] }
  | { readonly status: "failed"; readonly code: ViewFailureCode };

export const LOADING: ViewerState = { status: "loading" };

export const failed = (code: ViewFailureCode): ViewerState => ({ status: "failed", code });
