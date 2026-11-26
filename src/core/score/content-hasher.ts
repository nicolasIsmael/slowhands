export interface ContentHasher {
  /** A stable identifier for the bytes, as lower-case hexadecimal text. */
  hash(bytes: Uint8Array): Promise<string>;
}
