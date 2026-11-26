export type XmlEvent =
  | {
      readonly type: "start";
      readonly name: string;
      readonly attributes: Readonly<Record<string, string>>;
    }
  | { readonly type: "text"; readonly text: string }
  | { readonly type: "end"; readonly name: string };

export interface XmlEventSource {
  /**
   * Streams the events of an XML document. Throws a ScoreRejection with the code
   * `xml-malformed` when the document is not well formed or ends before it is complete.
   */
  events(bytes: Uint8Array): Iterable<XmlEvent>;
}
