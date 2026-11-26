import type { ArchiveReader } from "./archive-reader.ts";
import { MAX_CONTAINER_BYTES, MAX_UNPACKED_BYTES } from "./limits.ts";
import { ScoreRejection } from "./score-rejection.ts";
import type { XmlEventSource } from "./xml-event-source.ts";

const CONTAINER_PATH = "META-INF/container.xml";

/** Finds and unpacks the score inside a compressed MusicXML (`.mxl`) archive. */
export class MxlContainerReader {
  private readonly archive: ArchiveReader;
  private readonly xml: XmlEventSource;

  constructor(archive: ArchiveReader, xml: XmlEventSource) {
    this.archive = archive;
    this.xml = xml;
  }

  readScore(bytes: Uint8Array): Uint8Array {
    return this.archive.readEntry(bytes, this.rootFilePath(bytes), MAX_UNPACKED_BYTES);
  }

  private rootFilePath(bytes: Uint8Array): string {
    const names = new Set(this.archive.listEntries(bytes).map((entry) => entry.name));
    if (!names.has(CONTAINER_PATH)) {
      throw new ScoreRejection("archive-without-score");
    }
    const container = this.archive.readEntry(bytes, CONTAINER_PATH, MAX_CONTAINER_BYTES);
    const path = this.declaredPaths(container).find(
      (candidate) => !candidate.toLowerCase().startsWith("meta-inf/") && names.has(candidate),
    );
    if (path === undefined) {
      throw new ScoreRejection("archive-without-score");
    }
    return path;
  }

  private declaredPaths(container: Uint8Array): string[] {
    const paths: string[] = [];
    try {
      for (const event of this.xml.events(container)) {
        if (event.type === "start" && event.name === "rootfile" && event.attributes["full-path"]) {
          paths.push(event.attributes["full-path"]);
        }
      }
    } catch (error) {
      if (error instanceof ScoreRejection && error.code === "xml-malformed") {
        throw new ScoreRejection("archive-without-score");
      }
      throw error;
    }
    return paths;
  }
}
