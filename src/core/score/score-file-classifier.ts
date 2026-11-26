import { hasAcceptedScoreExtension } from "./score-extensions.ts";
import { ScoreRejection } from "./score-rejection.ts";

export type ScoreContainerKind = "xml" | "archive";

const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];

const FOREIGN_SIGNATURES: readonly (readonly number[])[] = [
  [0x25, 0x50, 0x44, 0x46], // PDF
  [0x89, 0x50, 0x4e, 0x47], // PNG
  [0xff, 0xd8, 0xff], // JPEG
  [0x47, 0x49, 0x46, 0x38], // GIF
  [0x4d, 0x54, 0x68, 0x64], // MIDI
  [0x49, 0x44, 0x33], // MP3 with an ID3 tag
  [0x52, 0x49, 0x46, 0x46], // WAV
  [0x4f, 0x67, 0x67, 0x53], // Ogg
  [0x66, 0x4c, 0x61, 0x43], // FLAC
];

function startsWith(head: Uint8Array, signature: readonly number[]): boolean {
  return signature.every((value, index) => head[index] === value);
}

function isBareMp3Frame(head: Uint8Array): boolean {
  return head[0] === 0xff && ((head[1] ?? 0) & 0xe0) === 0xe0;
}

export class ScoreFileClassifier {
  /** Decides how to read a file from its name and first bytes, or rejects it as unsupported. */
  classify(fileName: string, head: Uint8Array): ScoreContainerKind {
    if (!hasAcceptedScoreExtension(fileName)) {
      throw new ScoreRejection("unsupported-file-type");
    }
    if (startsWith(head, ZIP_SIGNATURE)) {
      return "archive";
    }
    if (
      FOREIGN_SIGNATURES.some((signature) => startsWith(head, signature)) ||
      isBareMp3Frame(head)
    ) {
      throw new ScoreRejection("unsupported-file-type");
    }
    return "xml";
  }
}
