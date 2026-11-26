import type { FileSource } from "@core/import/file-source.ts";

/** A file picked in the browser; its bytes are read only when asked for. */
export class BrowserFileSource implements FileSource {
  private readonly file: File;

  constructor(file: File) {
    this.file = file;
  }

  get name(): string {
    return this.file.name;
  }

  get sizeBytes(): number {
    return this.file.size;
  }

  async readBytes(): Promise<Uint8Array> {
    return new Uint8Array(await this.file.arrayBuffer());
  }
}
