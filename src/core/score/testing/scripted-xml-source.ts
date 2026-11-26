import type { XmlEvent, XmlEventSource } from "../xml-event-source.ts";

export const asciiBytes = (text: string): Uint8Array =>
  Uint8Array.from(text, (c) => c.charCodeAt(0));

const asciiText = (bytes: Uint8Array): string => String.fromCharCode(...bytes);

/** An XML source that answers with prepared events, chosen by the (ASCII) content it is given. */
export class ScriptedXmlSource implements XmlEventSource {
  private readonly scripts: ReadonlyMap<string, readonly XmlEvent[]>;

  constructor(scripts: Record<string, readonly XmlEvent[]>) {
    this.scripts = new Map(Object.entries(scripts));
  }

  events(bytes: Uint8Array): Iterable<XmlEvent> {
    return this.scripts.get(asciiText(bytes)) ?? [];
  }
}
