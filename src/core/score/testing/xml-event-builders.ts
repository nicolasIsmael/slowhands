import type { XmlEvent } from "../xml-event-source.ts";

/** Builds the events of one element: its start, its children, its end. */
export function element(
  name: string,
  children: readonly XmlEvent[] = [],
  attributes: Readonly<Record<string, string>> = {},
): XmlEvent[] {
  return [{ type: "start", name, attributes }, ...children, { type: "end", name }];
}

export function textElement(
  name: string,
  text: string,
  attributes: Readonly<Record<string, string>> = {},
): XmlEvent[] {
  return element(name, [{ type: "text", text }], attributes);
}

/** A minimal partwise score: one part with one measure, plus whatever head elements are given. */
export function partwiseScore(head: readonly XmlEvent[] = []): XmlEvent[] {
  const part = element("part", element("measure"));
  return element("score-partwise", [...head, ...part]);
}
