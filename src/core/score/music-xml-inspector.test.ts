import { expect, test } from "vitest";
import { MusicXmlInspector } from "./music-xml-inspector.ts";
import { ScoreRejection } from "./score-rejection.ts";
import { element, partwiseScore, textElement } from "./testing/xml-event-builders.ts";
import type { XmlEvent } from "./xml-event-source.ts";

const inspector = new MusicXmlInspector();

function codeOf(events: Iterable<XmlEvent>): string {
  try {
    inspector.inspect(events);
  } catch (error) {
    return error instanceof ScoreRejection ? error.code : "other error";
  }
  return "accepted";
}

const workTitle = (title: string): XmlEvent[] => element("work", textElement("work-title", title));
const composer = (name: string, type = "composer"): XmlEvent[] =>
  element("identification", textElement("creator", name, { type }));

test("accepts partwise and timewise scores", () => {
  expect(codeOf(partwiseScore())).toBe("accepted");
  const timewise = element("score-timewise", element("measure", element("part")));
  expect(codeOf(timewise)).toBe("accepted");
});

test("rejects a well-formed document that is not a score", () => {
  expect(codeOf(element("recipe", textElement("title", "Soup")))).toBe("not-a-score");
});

test("rejects a score with no part or no measure", () => {
  expect(codeOf(element("score-partwise"))).toBe("score-without-music");
  expect(codeOf(element("score-partwise", element("part")))).toBe("score-without-music");
});

test("does not count the part list as a part", () => {
  const listOnly = element("score-partwise", element("part-list", element("score-part")));
  expect(codeOf(listOnly)).toBe("score-without-music");
});

test("rejects a document that stops before its root closes", () => {
  const unfinished = partwiseScore().slice(0, -1);
  expect(codeOf(unfinished)).toBe("xml-malformed");
});

test("passes on a malformed-document rejection raised while streaming", () => {
  function* failing(): Generator<XmlEvent> {
    yield { type: "start", name: "score-partwise", attributes: {} };
    throw new ScoreRejection("xml-malformed");
  }
  expect(codeOf(failing())).toBe("xml-malformed");
});

test("reads the title from the work title", () => {
  const found = inspector.inspect(partwiseScore(workTitle("Moonlight")));
  expect(found.title).toBe("Moonlight");
});

test("falls back to the movement title", () => {
  const found = inspector.inspect(partwiseScore(textElement("movement-title", "Adagio")));
  expect(found.title).toBe("Adagio");
});

test("prefers the work title over the movement title", () => {
  const head = [...textElement("movement-title", "Adagio"), ...workTitle("Sonata")];
  expect(inspector.inspect(partwiseScore(head)).title).toBe("Sonata");
});

test("reads the creator whose type is composer", () => {
  expect(inspector.inspect(partwiseScore(composer("The Composer"))).composer).toBe("The Composer");
});

test("ignores creators that are not composers", () => {
  expect(inspector.inspect(partwiseScore(composer("A Lyricist", "lyricist"))).composer).toBeNull();
  const both = [...composer("A Lyricist", "lyricist"), ...composer("The Composer")];
  expect(inspector.inspect(partwiseScore(both)).composer).toBe("The Composer");
});

test("has no title and no composer when the score gives none", () => {
  expect(inspector.inspect(partwiseScore())).toEqual({ title: null, composer: null });
});

test("trims and collapses whitespace in the title", () => {
  const found = inspector.inspect(partwiseScore(workTitle("  Two   Words\n here ")));
  expect(found.title).toBe("Two Words here");
});

test("treats a blank title as no title", () => {
  expect(inspector.inspect(partwiseScore(workTitle("   "))).title).toBeNull();
});
