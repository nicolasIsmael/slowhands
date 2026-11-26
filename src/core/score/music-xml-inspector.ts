import { ScoreRejection } from "./score-rejection.ts";
import type { XmlEvent } from "./xml-event-source.ts";

export interface ScoreMetadata {
  readonly title: string | null;
  readonly composer: string | null;
}

type Field = "work" | "movement" | "composer";

const SCORE_ROOTS = new Set(["score-partwise", "score-timewise"]);

/** Walks the events of one document, keeping only what the checks and the metadata need. */
class InspectionWalk {
  private readonly path: string[] = [];
  private rootSeen = false;
  private parts = 0;
  private measures = 0;
  private readonly found: Record<Field, string | null> = {
    work: null,
    movement: null,
    composer: null,
  };
  private capture: { field: Field; depth: number; chunks: string[] } | null = null;

  accept(event: XmlEvent): void {
    if (event.type === "start") {
      this.start(event.name, event.attributes);
    } else if (event.type === "text") {
      this.capture?.chunks.push(event.text);
    } else {
      this.end();
    }
  }

  finish(): ScoreMetadata {
    if (!this.rootSeen || this.path.length > 0) {
      throw new ScoreRejection("xml-malformed");
    }
    if (this.parts === 0 || this.measures === 0) {
      throw new ScoreRejection("score-without-music");
    }
    return { title: this.found.work ?? this.found.movement, composer: this.found.composer };
  }

  private start(name: string, attributes: Readonly<Record<string, string>>): void {
    if (this.path.length === 0 && !SCORE_ROOTS.has(name)) {
      throw new ScoreRejection("not-a-score");
    }
    this.rootSeen = true;
    const parent = this.path[this.path.length - 1];
    this.path.push(name);
    this.parts += name === "part" ? 1 : 0;
    this.measures += name === "measure" ? 1 : 0;
    const field = this.fieldFor(name, parent, attributes);
    if (field !== null && this.capture === null) {
      this.capture = { field, depth: this.path.length, chunks: [] };
    }
  }

  private end(): void {
    if (this.capture !== null && this.capture.depth === this.path.length) {
      const text = this.capture.chunks.join("").replace(/\s+/g, " ").trim();
      this.found[this.capture.field] ||= text === "" ? null : text;
      this.capture = null;
    }
    this.path.pop();
  }

  private fieldFor(
    name: string,
    parent: string | undefined,
    attributes: Readonly<Record<string, string>>,
  ): Field | null {
    const depth = this.path.length;
    if (name === "work-title" && parent === "work" && depth === 3) {
      return "work";
    }
    if (name === "movement-title" && depth === 2) {
      return "movement";
    }
    const isComposer = name === "creator" && attributes.type === "composer";
    return isComposer && parent === "identification" && depth === 3 ? "composer" : null;
  }
}

export class MusicXmlInspector {
  /** Reads a whole document: any truncation or damage shows up as a rejection. */
  inspect(events: Iterable<XmlEvent>): ScoreMetadata {
    const walk = new InspectionWalk();
    for (const event of events) {
      walk.accept(event);
    }
    return walk.finish();
  }
}
