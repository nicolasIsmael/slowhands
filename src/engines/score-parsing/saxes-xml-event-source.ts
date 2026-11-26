import { ScoreRejection } from "@core/score/score-rejection.ts";
import type { XmlEvent, XmlEventSource } from "@core/score/xml-event-source.ts";
import { SaxesParser } from "saxes";
import { decodeXmlInPieces } from "./xml-text-decoder.ts";

/** Streams a document's events a piece at a time, so memory stays flat for large scores. */
export class SaxesXmlEventSource implements XmlEventSource {
  *events(bytes: Uint8Array): Generator<XmlEvent> {
    const queue: XmlEvent[] = [];
    const parser = new SaxesParser({ xmlns: false });
    parser.on("opentag", (tag) => {
      queue.push({
        type: "start",
        name: tag.name,
        attributes: { ...tag.attributes } as Record<string, string>,
      });
    });
    parser.on("text", (text) => queue.push({ type: "text", text }));
    parser.on("cdata", (text) => queue.push({ type: "text", text }));
    parser.on("closetag", (tag) => queue.push({ type: "end", name: tag.name }));

    for (const piece of decodeXmlInPieces(bytes)) {
      this.feed(() => parser.write(piece));
      yield* queue.splice(0);
    }
    this.feed(() => parser.close());
    yield* queue.splice(0);
  }

  private feed(action: () => unknown): void {
    try {
      action();
    } catch {
      throw new ScoreRejection("xml-malformed");
    }
  }
}
