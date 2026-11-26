import type { ArchiveEntry, ArchiveReader } from "../archive-reader.ts";
import { ScoreRejection } from "../score-rejection.ts";

/** An archive reader over entries held in memory; the bytes it is given are ignored. */
export class InMemoryArchive implements ArchiveReader {
  private readonly entries: ReadonlyMap<string, Uint8Array>;
  private readonly damaged: boolean;

  constructor(entries: Record<string, Uint8Array>, damaged = false) {
    this.entries = new Map(Object.entries(entries));
    this.damaged = damaged;
  }

  listEntries(): ArchiveEntry[] {
    this.failIfDamaged();
    return [...this.entries].map(([name, data]) => ({ name, uncompressedSize: data.length }));
  }

  readEntry(_bytes: Uint8Array, name: string, maxBytes: number): Uint8Array {
    this.failIfDamaged();
    const data = this.entries.get(name);
    if (data === undefined) {
      throw new ScoreRejection("archive-without-score");
    }
    if (data.length > maxBytes) {
      throw new ScoreRejection("unpacked-too-large");
    }
    return data;
  }

  private failIfDamaged(): void {
    if (this.damaged) {
      throw new ScoreRejection("archive-corrupted");
    }
  }
}
