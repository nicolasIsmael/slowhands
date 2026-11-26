import type { DuplicateMatch } from "../library/duplicate-match.ts";
import { replacementFor } from "../library/song-replacement.ts";
import type { DuplicateDecision, DuplicateNotice } from "./duplicate-decision.ts";
import type { FileSource } from "./file-source.ts";
import type { FileResult } from "./import-outcome.ts";
import {
  type AcceptedAnalysis,
  analyzeSafely,
  type BatchImportParts,
  newSongFrom,
  savedAs,
} from "./import-parts.ts";

/** A file that matches a song already in the library and waits for the person's decision. */
export interface HeldDuplicate {
  readonly fileIndex: number;
  readonly file: FileSource;
  readonly match: DuplicateMatch;
}

export function noticeFor({ fileIndex, file, match }: HeldDuplicate): DuplicateNotice {
  return {
    fileIndex,
    fileName: file.name,
    existingName: match.existing.displayName,
    reason: match.reason,
  };
}

async function replaceExisting(
  parts: BatchImportParts,
  file: FileSource,
  analysis: AcceptedAnalysis,
): Promise<FileResult> {
  const song = newSongFrom(parts, file, analysis);
  const current = await parts.finder.findDuplicate(song);
  if (current === null) {
    await parts.writer.add(song, analysis.bytes);
    return { kind: "imported", songId: song.id };
  }
  const replacement = replacementFor(current.existing, song);
  await parts.writer.replace(replacement.id, replacement, analysis.bytes);
  return { kind: "replaced", songId: replacement.id };
}

async function addAlongside(
  parts: BatchImportParts,
  file: FileSource,
  analysis: AcceptedAnalysis,
): Promise<FileResult> {
  const song = newSongFrom(parts, file, analysis);
  await parts.writer.add(song, analysis.bytes);
  return { kind: "kept-both", songId: song.id };
}

/**
 * Applies the person's decision to one held file. Skipping touches nothing; the other two read
 * the file again, because holding every file's bytes until the decision would cost memory.
 */
export async function resolveHeld(
  parts: BatchImportParts,
  decision: DuplicateDecision,
  { file }: HeldDuplicate,
): Promise<FileResult> {
  if (decision === "skip-all") {
    return { kind: "skipped" };
  }
  const analysis = await analyzeSafely(parts, file);
  if (analysis.status === "rejected") {
    return { kind: "failed", code: analysis.code };
  }
  const apply = decision === "replace-all" ? replaceExisting : addAlongside;
  return savedAs(() => apply(parts, file, analysis));
}
