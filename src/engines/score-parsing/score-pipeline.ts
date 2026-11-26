import { FileAnalyzer } from "@core/score/file-analyzer.ts";
import { FilePrecheck } from "@core/score/file-precheck.ts";
import { MusicXmlInspector } from "@core/score/music-xml-inspector.ts";
import { MxlContainerReader } from "@core/score/mxl-container.ts";
import { ScoreFileClassifier } from "@core/score/score-file-classifier.ts";
import { ScoreXmlLoader } from "@core/score/score-xml-loader.ts";
import { UndrawableNotationScanner } from "@core/score/undrawable-notation-scanner.ts";
import { ScorePreparation } from "@core/viewer/score-preparation.ts";
import { FflateArchiveReader } from "./fflate-archive-reader.ts";
import { SaxesXmlEventSource } from "./saxes-xml-event-source.ts";
import { WebCryptoContentHasher } from "./web-crypto-content-hasher.ts";

function createLoader(xml: SaxesXmlEventSource): ScoreXmlLoader {
  return new ScoreXmlLoader(new MxlContainerReader(new FflateArchiveReader(), xml));
}

/** The real file checker: core rules over the saxes, fflate and Web Crypto adapters. */
export function createFileAnalyzer(): FileAnalyzer {
  const xml = new SaxesXmlEventSource();
  return new FileAnalyzer({
    precheck: new FilePrecheck(),
    classifier: new ScoreFileClassifier(),
    loader: createLoader(xml),
    xml,
    inspector: new MusicXmlInspector(),
    hasher: new WebCryptoContentHasher(),
  });
}

/** The real work of opening a song: unpack, then scan for notation that cannot be drawn. */
export function createScorePreparation(): ScorePreparation {
  const xml = new SaxesXmlEventSource();
  return new ScorePreparation(createLoader(xml), xml, new UndrawableNotationScanner());
}
