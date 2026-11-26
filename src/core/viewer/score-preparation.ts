import type { ScoreFormat } from "../library/song-record.ts";
import type { ScoreXmlLoader } from "../score/score-xml-loader.ts";
import type { UndrawableNotationScanner } from "../score/undrawable-notation-scanner.ts";
import type { XmlEventSource } from "../score/xml-event-source.ts";
import type { PreparedScore } from "./prepared-score.ts";

/** The work of opening a song that does not need the screen: unpack, then scan. */
export class ScorePreparation {
  private readonly loader: ScoreXmlLoader;
  private readonly xml: XmlEventSource;
  private readonly scanner: UndrawableNotationScanner;

  constructor(loader: ScoreXmlLoader, xml: XmlEventSource, scanner: UndrawableNotationScanner) {
    this.loader = loader;
    this.xml = xml;
    this.scanner = scanner;
  }

  prepare(bytes: Uint8Array, format: ScoreFormat): PreparedScore {
    const scoreXml = this.loader.load(bytes, format);
    return { xml: scoreXml, notices: this.scanner.scan(this.xml.events(scoreXml)) };
  }
}
