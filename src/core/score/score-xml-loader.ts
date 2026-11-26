import type { ScoreFormat } from "../library/song-record.ts";
import type { MxlContainerReader } from "./mxl-container.ts";

/** Turns a stored original (plain XML or a compressed archive) into score XML. */
export class ScoreXmlLoader {
  private readonly container: MxlContainerReader;

  constructor(container: MxlContainerReader) {
    this.container = container;
  }

  load(bytes: Uint8Array, format: ScoreFormat): Uint8Array {
    return format === "mxl" ? this.container.readScore(bytes) : bytes;
  }
}
