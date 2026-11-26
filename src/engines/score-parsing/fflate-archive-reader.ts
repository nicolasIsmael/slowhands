import type { ArchiveEntry, ArchiveReader } from "@core/score/archive-reader.ts";
import { ScoreRejection } from "@core/score/score-rejection.ts";
import { type UnzipFileFilter, unzipSync } from "fflate";

export class FflateArchiveReader implements ArchiveReader {
  listEntries(bytes: Uint8Array): ArchiveEntry[] {
    const entries: ArchiveEntry[] = [];
    this.unzip(bytes, (file) => {
      entries.push({ name: file.name, uncompressedSize: file.originalSize });
      return false;
    });
    return entries;
  }

  readEntry(bytes: Uint8Array, name: string, maxBytes: number): Uint8Array {
    let found = false;
    let tooLarge = false;
    const files = this.unzip(bytes, (file) => {
      if (file.name !== name) {
        return false;
      }
      found = true;
      tooLarge = file.originalSize > maxBytes;
      return !tooLarge;
    });
    if (tooLarge) {
      throw new ScoreRejection("unpacked-too-large");
    }
    const data = files[name];
    if (!found) {
      throw new ScoreRejection("archive-without-score");
    }
    if (data === undefined) {
      throw new ScoreRejection("archive-corrupted");
    }
    return data;
  }

  private unzip(bytes: Uint8Array, filter: UnzipFileFilter): Record<string, Uint8Array> {
    try {
      return unzipSync(bytes, { filter });
    } catch {
      throw new ScoreRejection("archive-corrupted");
    }
  }
}
