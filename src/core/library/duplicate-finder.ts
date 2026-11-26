import type { DuplicateMatch } from "./duplicate-match.ts";

export interface DuplicateCandidate {
  readonly contentHash: string;
  readonly identityKey: string;
}

export interface DuplicateFinder {
  findDuplicate(candidate: DuplicateCandidate): Promise<DuplicateMatch | null>;
}
