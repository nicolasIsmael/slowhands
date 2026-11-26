import type { ScoreFormat } from "../library/song-record.ts";
import type { AnalysisResult } from "./analysis-result.ts";
import type { ContentHasher } from "./content-hasher.ts";
import type { FilePrecheck } from "./file-precheck.ts";
import type { MusicXmlInspector } from "./music-xml-inspector.ts";
import type { ScoreFileClassifier } from "./score-file-classifier.ts";
import { ScoreRejection } from "./score-rejection.ts";
import type { ScoreSummary } from "./score-summary.ts";
import type { ScoreXmlLoader } from "./score-xml-loader.ts";
import type { XmlEventSource } from "./xml-event-source.ts";

export interface FileAnalyzerParts {
  precheck: FilePrecheck;
  classifier: ScoreFileClassifier;
  loader: ScoreXmlLoader;
  xml: XmlEventSource;
  inspector: MusicXmlInspector;
  hasher: ContentHasher;
}

const HEAD_BYTES = 16;

/** Decides whether a file is a score and learns its title, composer and content hash. */
export class FileAnalyzer {
  private readonly parts: FileAnalyzerParts;

  constructor(parts: FileAnalyzerParts) {
    this.parts = parts;
  }

  async analyze(fileName: string, bytes: Uint8Array): Promise<AnalysisResult> {
    try {
      return { status: "accepted", summary: await this.summarize(fileName, bytes) };
    } catch (error) {
      const code = error instanceof ScoreRejection ? error.code : "unexpected-error";
      return { status: "rejected", code };
    }
  }

  private async summarize(fileName: string, bytes: Uint8Array): Promise<ScoreSummary> {
    const { precheck, classifier, loader, xml, inspector, hasher } = this.parts;
    const refusal = precheck.check(fileName, bytes.length);
    if (refusal !== null) {
      throw new ScoreRejection(refusal);
    }
    const kind = classifier.classify(fileName, bytes.subarray(0, HEAD_BYTES));
    const format: ScoreFormat = kind === "archive" ? "mxl" : "musicxml";
    const scoreXml = loader.load(bytes, format);
    const metadata = inspector.inspect(xml.events(scoreXml));
    return { ...metadata, format, contentHash: await hasher.hash(scoreXml) };
  }
}
