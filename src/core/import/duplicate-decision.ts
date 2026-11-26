import type { DuplicateReason } from "../library/duplicate-match.ts";

/** The one choice that applies to every duplicate of a batch. */
export type DuplicateDecision = "replace-all" | "keep-both-all" | "skip-all";

/** What the person is told about one duplicate before choosing. */
export interface DuplicateNotice {
  /** The file's place in the batch, which tells apart two files that share a name. */
  readonly fileIndex: number;
  readonly fileName: string;
  readonly existingName: string;
  readonly reason: DuplicateReason;
}

/** Asks the person about all the duplicates at once; closing the question must answer `skip-all`. */
export type DuplicateDecider = (notices: readonly DuplicateNotice[]) => Promise<DuplicateDecision>;
