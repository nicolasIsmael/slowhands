export interface ArchiveEntry {
  readonly name: string;
  readonly uncompressedSize: number;
}

export interface ArchiveReader {
  /** Lists the entries without unpacking them. Throws `archive-corrupted` for a damaged archive. */
  listEntries(bytes: Uint8Array): ArchiveEntry[];

  /**
   * Unpacks one entry. Throws `archive-corrupted` for a damaged archive, `archive-without-score`
   * when the entry does not exist and `unpacked-too-large` (before unpacking) when the entry is
   * larger than `maxBytes`.
   */
  readEntry(bytes: Uint8Array, name: string, maxBytes: number): Uint8Array;
}
