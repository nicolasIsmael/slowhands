/** A file the person picked. Its bytes are read only when needed. */
export interface FileSource {
  readonly name: string;
  readonly sizeBytes: number;
  readBytes(): Promise<Uint8Array>;
}
